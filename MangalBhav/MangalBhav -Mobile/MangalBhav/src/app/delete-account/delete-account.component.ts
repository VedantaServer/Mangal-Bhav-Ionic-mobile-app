import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { ApiNU } from '../../providers';
import { Storage } from '@ionic/storage-angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-delete-account',
  templateUrl: './delete-account.component.html',
  styleUrls: ['./delete-account.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class DeleteAccountComponent implements OnInit {

  userDetails: any;
  step: 'confirm' | 'otp' | 'final' = 'confirm';

  otp: string = '';
  generatedOtp: string = '';
  otpSent: boolean = false;
  isLoading: boolean = false;

  constructor(
    private routerCtrl: NavController,
    private apinu: ApiNU,
    private storage: Storage,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.userDetails = await this.storage.get('account');
  }

  // ── Step 1: User reads warning, clicks "I understand, proceed" ──
  async onProceedFromWarning() {
    const confirmed = confirm(
      '⚠️ Are you sure you want to delete your account?\n\nThis action cannot be undone. All your bookings, profile and data will be permanently removed.'
    );
    if (!confirmed) return;

    this.step = 'otp';
    this.sendOtp();
  }

  // ── Step 2: Send OTP ──
  sendOtp() {
    this.isLoading = true;
    const mobile = this.userDetails?.LoginID;

    // Fixed OTP for test numbers
    if (['9899252291', '9310050113', '9891643013'].includes(mobile?.toString())) {
      this.generatedOtp = '111111';
    } else {
      this.generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    }

    this.apinu.postUrlData(
      `SendOtpSms?mobileNo=${mobile}&otp=${this.generatedOtp}`, null
    ).subscribe({
      next: () => {
        this.otpSent = true;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        alert('Failed to send OTP. Please try again.');
      }
    });
  }

  resendOtp() {
    this.otp = '';
    this.otpSent = false;
    this.sendOtp();
  }

  // ── Step 3: Verify OTP ──
  verifyOtp() {
    if (!this.otp || this.otp.toString().length < 4) {
      alert('Please enter a valid OTP');
      return;
    }

    if (this.otp.toString() !== this.generatedOtp.toString()) {
      alert('❌ Incorrect OTP. Please try again.');
      return;
    }

    // OTP correct → show final confirmation
    this.step = 'final';
  }

  // ── Step 4: Final confirmation before actual deletion ──
  async onFinalDelete() {
    const finalConfirm = confirm(
      '🗑️ FINAL WARNING\n\nYour account will be permanently deleted right now.\n\nType OK to confirm deletion.'
    );
    if (!finalConfirm) return;

    this.deleteAccount();
  }

  // ── Step 5: Call API, clear storage, redirect ──
  deleteAccount() {
    this.isLoading = true;
    const mobile = this.userDetails?.LoginID;

    const updatedUser = {
      ...this.userDetails,
      LoginID: `${mobile}-deleted`,
      PasswordHash : 'DELETED',
      Status: 'SUSPENDED',
      DateAdded : new Date(),
      DateMordified: new Date(),
      UpdatedByUser: String(mobile),
    };

    this.apinu.postUrlData('UsersUpdate', updatedUser).subscribe({
      next: async (res: any) => {
        if (res?.UserID > 0) {
          await this.storage.clear();
          alert('✅ Your account has been deleted successfully.\n\nThank you for using Mangal Bhav. 🙏');
          window.location.href = '/login';
        } else {
          this.isLoading = false;
          alert('Something went wrong. Please contact support.');
        }
      },
      error: () => {
        this.isLoading = false;
        alert('❌ Deletion failed. Please try again or contact support.');
      }
    });
  }

  goBack() {
    this.routerCtrl.back();
  }
}