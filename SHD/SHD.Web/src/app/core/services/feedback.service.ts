import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Feedback } from '../models/shd.models';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = 'http://localhost:5034/api/feedbacks'; // Adjust port if needed

  constructor(private http: HttpClient) { }

  getFeedbacks(status?: string, type?: string, search?: string, page: number = 1, pageSize: number = 10): Observable<Feedback[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (status) params = params.set('status', status);
    if (type) params = params.set('type', type);
    if (search) params = params.set('search', search);

    return this.http.get<Feedback[]>(this.apiUrl, { params });
  }

  getFeedback(id: number): Observable<Feedback> {
    return this.http.get<Feedback>(`${this.apiUrl}/${id}`);
  }

  createFeedback(feedback: Partial<Feedback>): Observable<Feedback> {
    return this.http.post<Feedback>(this.apiUrl, feedback);
  }

  updateFeedback(id: number, feedback: Partial<Feedback>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, feedback);
  }

  deleteFeedback(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
