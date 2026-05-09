import {
  Component,
  inject,
  effect,
  OnInit,
  OnDestroy
} from '@angular/core';

import OlMap from 'ol/Map.js';
import View from 'ol/View.js';

import { defaults as defaultControls } from 'ol/control/defaults.js';
import FullScreen from 'ol/control/FullScreen.js';

import { defaults as defaultInteractions } from 'ol/interaction/defaults.js';
import DragRotateAndZoom from 'ol/interaction/DragRotateAndZoom.js';

import TileLayer from 'ol/layer/Tile.js';
import VectorLayer from 'ol/layer/Vector.js';

import XYZ from 'ol/source/XYZ.js';
import VectorSource from 'ol/source/Vector.js';

import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';

import { fromLonLat, toLonLat } from 'ol/proj.js';

import Style from 'ol/style/Style.js';
import Icon from 'ol/style/Icon.js';

import { FlightsService } from '../../../services/flights.service';
import { Flight } from '../../interfaces/flight.interface';

@Component({
  selector: 'app-map',
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class MapComponent implements OnInit, OnDestroy {

  private flightsService = inject(FlightsService);

  private map: OlMap | null = null;
  private vectorSource = new VectorSource();

  private flightFeatures: Map<string, Feature> = new Map();

  private refreshInterval: any;
  private animationFrame: any;

  constructor() {
    effect(() => {
      const flights = this.flightsService.flights();
      this.updateFlights(flights);
    });
  }

  ngOnInit(): void {

    this.map = new OlMap({

      controls: defaultControls().extend([
        new FullScreen()
      ]),

      interactions: defaultInteractions().extend([
        new DragRotateAndZoom()
      ]),

      layers: [

        new TileLayer({
          source: new XYZ({
            url: 'https://api.maptiler.com/maps/hybrid-v4/{z}/{x}/{y}@2x.jpg?key=bZ943IENWwexU3umotpo',
            attributions: '© MapTiler'
          }),
        }),

        new VectorLayer({
          source: this.vectorSource
        })

      ],

      target: 'map',

      view: new View({
        center: fromLonLat([2.0833, 41.2974]),
        zoom: 11,
      }),

    });

    setTimeout(() => {
      this.map?.updateSize();
      this.map?.render();
    }, 100);

    this.startAutoRefresh();
    this.animate();
  }

  startAutoRefresh() {

    this.stopAutoRefresh();

    this.refreshInterval = setInterval(() => {

      if (!this.map) return;

      const center = this.map.getView().getCenter();
      if (!center) return;

      const [lon, lat] = toLonLat(center);

      this.flightsService.loadFlights(lat, lon, 60);

    }, 2000);
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  // 🔥 distancia en coordenadas proyectadas
  private distance(a: number[], b: number[]) {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  updateFlights(flights: Flight[]) {

    const now = Date.now();

    for (const flight of flights) {

      if (!flight.latitude || !flight.longitude) continue;

      const coords = fromLonLat([flight.longitude, flight.latitude]);

      let feature = this.flightFeatures.get(flight.icao24);

      if (feature) {

        const geometry = feature.getGeometry();

        if (geometry instanceof Point) {

          const lastRealCoords = feature.get('lastRealCoords') || coords;
          const dist = this.distance(lastRealCoords, coords);

          // 🔥 velocidad más estable
          const speedFactor = 0.0005;

          const duration = Math.max(1200, dist / speedFactor);

          feature.set('fromCoords', lastRealCoords);
          feature.set('toCoords', coords);
          feature.set('startTime', now);
          feature.set('duration', duration);

          feature.set('lastRealCoords', coords);
        }

        feature.set('flight', flight);
        feature.set('lastSeen', now);
        feature.setStyle(this.getStyle(flight));

      } else {

        feature = new Feature({
          geometry: new Point(coords),
          flight
        });

        feature.set('fromCoords', coords);
        feature.set('toCoords', coords);
        feature.set('startTime', now);
        feature.set('duration', 2000);
        feature.set('lastSeen', now);
        feature.set('lastRealCoords', coords);

        feature.setStyle(this.getStyle(flight));

        this.vectorSource.addFeature(feature);
        this.flightFeatures.set(flight.icao24, feature);
      }
    }

    // 🧹 cleanup
    this.flightFeatures.forEach((feature, id) => {

      const lastSeen = feature.get('lastSeen');

      if (now - lastSeen > 5000) {
        this.vectorSource.removeFeature(feature);
        this.flightFeatures.delete(id);
      }

    });

    this.vectorSource.changed();
  }

  getStyle(flight: Flight) {

    return new Style({
      image: new Icon({
        src: 'plane.png',
        scale: 0.08,
        rotation: (flight.heading ?? 0) * Math.PI / 180,
      })
    });
  }

  animate = () => {

    const now = Date.now();

    this.flightFeatures.forEach((feature) => {

      const geom = feature.getGeometry();
      if (!(geom instanceof Point)) return;

      const from = feature.get('fromCoords');
      const to = feature.get('toCoords');
      const start = feature.get('startTime');
      const duration = feature.get('duration') || 2000;

      if (!from || !to || !start) return;

      let t = (now - start) / duration;
      t = Math.max(0, Math.min(1, t));

      // suavizado
      t = t * t * (3 - 2 * t);

      const x = from[0] + (to[0] - from[0]) * t;
      const y = from[1] + (to[1] - from[1]) * t;

      geom.setCoordinates([x, y]);

    });

    this.vectorSource.changed();

    this.animationFrame = requestAnimationFrame(this.animate);
  };

  ngOnDestroy(): void {
    this.stopAutoRefresh();
    cancelAnimationFrame(this.animationFrame);
  }
}
