import { Component, signal,OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { Navbar } from "./components/navbar/navbar";
import { Sidenav } from "./components/sidenav/sidenav";
import {  MapComponent } from "./components/map/map";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Sidenav,MapComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('myFlysy');

   ngOnInit(): void{
    initFlowbite()
  }
}
