import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  step: 1 | 2 = 1;
  email = '';
  otp = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) { }

  requestOtp() {
    if (!this.email) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.authService.requestOtp(this.email).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.step = 2;
          this.successMessage = res.message;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to send OTP. Please try again.';
      }
    });
  }

  verifyOtp() {
    if (!this.otp) {
      this.errorMessage = 'Please enter the OTP.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.authService.verifyOtp(this.email, this.otp).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid OTP. Please try again.';
      }
    });
  }

  goBack() {
    this.step = 1;
    this.otp = '';
    this.errorMessage = '';
    this.successMessage = '';
  }
}
