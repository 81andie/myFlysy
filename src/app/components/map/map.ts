import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map.js';
import { defaults as defaultControls } from 'ol/control/defaults.js';
import DragRotateAndZoom from 'ol/interaction/DragRotateAndZoom.js';
import {defaults as defaultInteractions} from 'ol/interaction/defaults.js';
import FullScreen from 'ol/control/FullScreen.js';
import TileLayer from 'ol/layer/Tile.js';
import TileJSON from 'ol/source/TileJSON.js';
import Style from 'ol/style/Style';
import Attribution from 'ol/control/Attribution.js';
import View from 'ol/View.js';
import Layer from 'ol/layer/WebGLTile.js';
import Source from 'ol/source/ImageTile.js';
import { fromLonLat } from 'ol/proj.js';
import XYZ from 'ol/source/XYZ';


@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class MapComponent implements OnInit {


  private map: Map | null = null;


  ngOnInit(): void {

    this.map = new Map({
      controls: defaultControls().extend([new FullScreen()]),
      interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
      layers: [
        new TileLayer({
          source: new XYZ({
            url:'https://api.maptiler.com/maps/hybrid-v4/{z}/{x}/{y}@2x.jpg?key=bZ943IENWwexU3umotpo',
            attributions: '© MapTiler'
          }),
        }),
      ],
      target: 'map',
      view: new View({
        center: [311158.68373997946, 5157606.481663526],
        zoom: 5,
      }),


    });


  }





}
