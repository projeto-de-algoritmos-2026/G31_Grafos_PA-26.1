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

  carregarRuas() {
    this.http.get<any>('assets/roads.json')
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      data.features.forEach((feature: any) => {
        const coords = feature.geometry.coordinates;

        const latlngs = coords.map((c: number[]) => [c[1], c[0]]);

        L.polyline(latlngs, {
          color: 'blue',
          weight: 2
        }).addTo(this.map);
      });
    });
  }
}
