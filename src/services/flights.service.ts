import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Flight } from '../app/interfaces/flight.interface';

@Injectable({
  providedIn: 'root'
})
export class FlightsService {

  private http = inject(HttpClient);

  private API =
    'https://spaceairbackend.onrender.com/states';

  flights = signal<Flight[]>([]);

  selectedFlight =
    signal<Flight | null>(null);

  loading = signal(false);

  lastCenter =
    signal<{ lat: number; lon: number } | null>(null);

  // -------------------------
  // LOAD FLIGHTS
  // -------------------------
  loadFlights(
    lat: number,
    lon: number,
    dist: number = 80
  ) {

    this.loading.set(true);

    this.lastCenter.set({ lat, lon });

    this.http.get<{ flights: Flight[] }>(
      `${this.API}?lat=${lat}&lon=${lon}&dist=${dist}`
    )
      .subscribe({

        next: (res) => {

          // 🔥 IMPORTANTE:
          // NO VACIAR SI VIENE VACÍO
          if (res.flights?.length) {

            this.flights.set(res.flights);

          }

          this.loading.set(false);

        },

        error: (err) => {

          console.error(err);

          // ❌ NO HACER:
          // this.flights.set([]);

          this.loading.set(false);

        }

      });

  }

  // -------------------------
  // SELECT FLIGHT
  // -------------------------
  selectFlight(flight: Flight | null) {

    this.selectedFlight.set(flight);

  }

  clearSelection() {

    this.selectedFlight.set(null);

  }


}
