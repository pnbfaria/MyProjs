import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  RefStatus, RefType, RefSeverity, RefCategory, RefChannel,
  RefFrequency, RefPlace, RefSubject, RefVisibility, OrgUnit
} from '../models/shd.models';

@Injectable({
  providedIn: 'root'
})
export class ReferenceService {
  private apiUrl = 'http://localhost:5034/api/referencedata';

  constructor(private http: HttpClient) { }

  getStatuses(): Observable<RefStatus[]> { return this.http.get<RefStatus[]>(`${this.apiUrl}/statuses`); }
  getTypes(): Observable<RefType[]> { return this.http.get<RefType[]>(`${this.apiUrl}/types`); }
  getSeverities(): Observable<RefSeverity[]> { return this.http.get<RefSeverity[]>(`${this.apiUrl}/severities`); }
  getCategories(): Observable<RefCategory[]> { return this.http.get<RefCategory[]>(`${this.apiUrl}/categories`); }
  getChannels(): Observable<RefChannel[]> { return this.http.get<RefChannel[]>(`${this.apiUrl}/channels`); }
  getFrequencies(): Observable<RefFrequency[]> { return this.http.get<RefFrequency[]>(`${this.apiUrl}/frequencies`); }
  getPlaces(): Observable<RefPlace[]> { return this.http.get<RefPlace[]>(`${this.apiUrl}/places`); }
  getSubjects(): Observable<RefSubject[]> { return this.http.get<RefSubject[]>(`${this.apiUrl}/subjects`); }
  getOrgUnits(): Observable<OrgUnit[]> { return this.http.get<OrgUnit[]>(`${this.apiUrl}/orgunits`); }
  getVisibilities(): Observable<RefVisibility[]> { return this.http.get<RefVisibility[]>(`${this.apiUrl}/visibilities`); }
}
