import { CommonModule } from '@angular/common';
import { Component, effect, inject, Inject, PLATFORM_ID } from '@angular/core';
import { FlightsService } from '../../../services/flights.service';
import { Flight } from '../../interfaces/flight.interface';

@Component({
  selector: 'app-sidenav',
  imports: [CommonModule],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.css',
})
export class Sidenav {

  constructor(@Inject(PLATFORM_ID) platformId: Object) {

    effect(() => {
     
      this.opened = !!this.flight()
    })


  }

  private flightState = inject(FlightsService);


  public flight = this.flightState.selectedFlight
  opened = false;

  toggle() {
    if (this.flight()) return;
    this.opened = true

  }

  clear() {

    this.opened = false;
  }
}
