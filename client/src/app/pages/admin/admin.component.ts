import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-900 p-8 text-white">
      <h1 class="text-3xl font-bold mb-6 text-center">Election Commission Dashboard</h1>

      <div *ngIf="!isAuthenticated" class="max-w-md mx-auto bg-gray-800 p-6 rounded-lg">
        <input [(ngModel)]="password" type="password" placeholder="Enter Admin Password" 
          class="w-full bg-gray-700 p-3 rounded mb-4">
        <button (click)="fetchResults()" class="w-full bg-blue-600 py-2 rounded font-bold">Access Data</button>
      </div>

      <div *ngIf="isAuthenticated" class="max-w-4xl mx-auto">
        <div class="grid grid-cols-2 gap-4 mb-8">
            <div class="bg-gray-800 p-4 rounded text-center">
                <h3 class="text-gray-400">Total Voters</h3>
                <p class="text-3xl font-bold">{{ stats.totalVoters }}</p>
            </div>
            <div class="bg-gray-800 p-4 rounded text-center border border-green-500">
                <h3 class="text-green-400">Votes Cast</h3>
                <p class="text-3xl font-bold text-green-500">{{ stats.totalVoted }}</p>
            </div>
        </div>

        <table class="w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead class="bg-gray-700">
                <tr>
                    <th class="p-4 text-left">Candidate</th>
                    <th class="p-4 text-left">Party</th>
                    <th class="p-4 text-right">Votes Secured</th>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let c of results" class="border-b border-gray-700">
                    <td class="p-4 font-bold">{{ c.name }}</td>
                    <td class="p-4 text-gray-400">{{ c.party }}</td>
                    <td class="p-4 text-right text-yellow-400 font-mono text-xl">{{ c.voteCount }}</td>
                </tr>
            </tbody>
        </table>
        
        <button (click)="isAuthenticated = false" class="mt-8 text-gray-500 underline text-sm">Logout</button>
      </div>
    </div>
  `
})
export class AdminComponent {
  password = '';
  isAuthenticated = false;
  results: any[] = [];
  stats: any = {};

  constructor(private http: HttpClient) {}

  fetchResults() {
    this.http.post<any>('http://localhost:3000/api/admin/results', { password: this.password })
      .subscribe({
        next: (data) => {
          this.isAuthenticated = true;
          this.results = data.results;
          this.stats = data.stats;
        },
        error: () => alert('Wrong Password!')
      });
  }
}