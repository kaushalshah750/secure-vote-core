import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  name: string = '';
  phone: string = '';
  isLoading = false;
  errorMessage = '';

  constructor(private api: ApiService, private router: Router) {}

  onLogin() {
    if (!this.name || !this.phone) {
      this.errorMessage = 'Please enter both Name and Mobile Number';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.api.login(this.name, this.phone).subscribe({
      next: (res) => {
        // Save Voter ID & Name temporarily
        localStorage.setItem('voterId', res.voterId);
        localStorage.setItem('voterName', res.name);
        localStorage.setItem('endTime', res.endTime); // For Timer
        this.router.navigate(['/vote']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Login Failed. Check credentials.';
      }
    });
  }
}