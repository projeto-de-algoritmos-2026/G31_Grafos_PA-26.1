import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  private map!: L.Map;
  private destroy$ = new Subject<void>();

  private graph = new Map<
    string,
    { lat: number; lng: number; neighbors: Map<string, L.Polyline> }
  >();
  private markerByKey = new Map<string, L.Marker>();
  private selectedNodeKey: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.initMap();
    this.carregarRuas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initMap() {
    this.map = L.map('map').setView([-16.0189, -48.0517], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);
  }

  private getNodeKey(lat: number, lng: number): string {
    return `${lat.toFixed(6)},${lng.toFixed(6)}`;
  }

  carregarRuas() {
    this.http.get<any>('assets/roads.json')
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      const minLng = -48.13;
      const maxLng = -48;
      const minLat = -16.002446;
      const maxLat = -15.994777;

      this.graph.clear();
      this.markerByKey.clear();
      this.selectedNodeKey = null;

      data.features.forEach((feature: any) => {
        const coords = feature.geometry.coordinates;

        const isInsideRegion = coords.every((c: number[]) => {
          const lng = c[0];
          const lat = c[1];
          return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
        });

        if (!isInsideRegion) {
          return;
        }

        coords.forEach((c: number[]) => {
          const lat = c[1];
          const lng = c[0];
          const key = this.getNodeKey(lat, lng);

          if (!this.graph.has(key)) {
            this.graph.set(key, {
              lat,
              lng,
              neighbors: new Map<string, L.Polyline>()
            });
          }
        });

        for (let i = 0; i < coords.length - 1; i++) {
          const c1 = coords[i];
          const c2 = coords[i + 1];

          const lat1 = c1[1];
          const lng1 = c1[0];
          const lat2 = c2[1];
          const lng2 = c2[0];

          const keyA = this.getNodeKey(lat1, lng1);
          const keyB = this.getNodeKey(lat2, lng2);

          const latlngsEdge: [number, number][] = [
            [lat1, lng1],
            [lat2, lng2]
          ];

          const edgePolyline = L.polyline(latlngsEdge, {
            color: 'blue',
            weight: 2
          }).addTo(this.map);

          const nodeA = this.graph.get(keyA)!;
          const nodeB = this.graph.get(keyB)!;

          nodeA.neighbors.set(keyB, edgePolyline);
          nodeB.neighbors.set(keyA, edgePolyline);
        }
      });

      this.graph.forEach((node, key) => {
        const marker = L.marker([node.lat, node.lng]).addTo(this.map);
        this.markerByKey.set(key, marker);

        marker.on('click', () => this.onMarkerClick(key));
      });
    });
  }

  private onMarkerClick(nodeKey: string): void {
    if (!this.selectedNodeKey) {
      this.selectedNodeKey = nodeKey;
      return;
    }

    if (this.selectedNodeKey === nodeKey) {
      this.selectedNodeKey = null;
      return;
    }

    const fromKey = this.selectedNodeKey;
    const toKey = nodeKey;
    this.selectedNodeKey = null;

    const fromNode = this.graph.get(fromKey);
    if (!fromNode) {
      return;
    }

    const edge = fromNode.neighbors.get(toKey);
    if (edge) {
      edge.setStyle({ color: 'red' });
    }
  }
}
