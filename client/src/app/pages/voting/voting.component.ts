import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-voting',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voting.component.html',
  styleUrl: './voting.component.scss'
})
export class VotingComponent implements OnInit, OnDestroy {
  voterName: string = '';
  candidates: any[] = [];
  selectedCandidateId: string | null = null;
  
  // Timer State
  endTime: any;
  timeLeftString: string = 'Loading...';
  timerInterval: any;
  isVotingOpen = true;
  isLoading = false;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    // 1. Check Auth (Agar direct URL hit kiya toh login pe bhejo)
    const voterId = localStorage.getItem('voterId');
    this.voterName = localStorage.getItem('voterName') || 'Voter';
    const endTimeStr = localStorage.getItem('endTime');

    if (!voterId) {
      this.router.navigate(['/login']);
      return;
    }

    // 2. Start Timer
    if (endTimeStr) {
      this.endTime = new Date(endTimeStr).getTime();
      this.startTimer();
    }

    // 3. Load Candidates
    this.loadCandidates();
  }

  loadCandidates() {
    this.api.getCandidates().subscribe({
      next: (data) => this.candidates = data,
      error: () => alert('Failed to load candidates. Refresh page.')
    });
  }

  selectCandidate(id: string) {
    this.selectedCandidateId = id;
  }

  submitVote() {
    if (!this.selectedCandidateId) return;
    
    const confirmVote = confirm('Are you sure? Your vote cannot be changed.');
    if (!confirmVote) return;

    this.isLoading = true;
    const voterId = localStorage.getItem('voterId') || '';

    this.api.vote(voterId, this.selectedCandidateId).subscribe({
      next: () => {
        // Clear Local Storage (Security)
        localStorage.clear(); 
        this.router.navigate(['/success']);
      },
      error: (err) => {
        alert(err.error?.message || 'Voting Failed');
        this.isLoading = false;
        // Agar already voted hai, toh login pe fek do
        if (err.status === 403) {
          localStorage.clear();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const distance = this.endTime - now;

      if (distance < 0) {
        clearInterval(this.timerInterval);
        this.timeLeftString = "VOTING CLOSED";
        this.isVotingOpen = false;
      } else {
        // Calculate Hours, Minutes, Seconds
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        this.timeLeftString = `${hours}h ${minutes}m ${seconds}s`;
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }
}