import L from 'leaflet';

declare module 'leaflet' {
  interface EditOptions {
    draggable?: boolean;
    snappable?: boolean;
    snapDistance?: number;
    allowSelfIntersections?: boolean;
    preventMarkerRemoval?: boolean;
  }

  interface Marker {
    pm: MarkerPM;
  }

  interface Polyline {
    pm: PolylinePM;
  }

  interface PolylinePM {
    enable(options?: EditOptions);
    disable();
    _markers: any[];
  }

  interface MarkerPM {
    enable(options?: EditOptions);
    disable();
  }
}
