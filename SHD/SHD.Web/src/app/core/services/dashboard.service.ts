import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:5034/api/dashboard';

  constructor(private http: HttpClient) { }

  getDashboardData(period: string = 'mois'): Observable<any> {
    const params = new HttpParams().set('period', period);
    return this.http.get<any>(this.apiUrl, { params });
  }
}
