export interface Flight {

  icao24: string;

  callsign: string | null;

  originCountry: string;

  registration: string | null;

  aircraft: string | null;

  squawk: string | null;

  latitude: number;

  longitude: number;

  altitude: number | null;

  heading: number | null;

  velocity: number | null;

  verticalRate: number | null;

  emergency: string;

  category: string | null;

  seen: number | null;

}
