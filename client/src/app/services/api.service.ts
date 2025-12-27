import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Backend URL (Localhost for now)
  private apiUrl = '/api';
  // private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // 1. Login (Name + Phone)
  login(name: string, phone: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { name, phone });
  }

  // 2. Get Candidates
  getCandidates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/candidates`);
  }

  // 3. Cast Vote
  vote(voterId: string, candidateId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/vote`, { voterId, candidateId });
  }
}