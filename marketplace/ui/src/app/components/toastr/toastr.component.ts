import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'toastr',
  standalone: true,
  templateUrl: './toastr.component.html',
  styleUrls: ['./toastr.component.scss'],  // Corrected from styleUrl to styleUrls
  imports: [CommonModule]
})

export class ToastrComponent {
  toastrStatus = 'New Notif';
  toastrMessage = 'some much longer message to be put here, and what happens if we add more text and more text...';
  link: string = 'https://sepolia.etherscan.io/tx/0xb4aba7cf4740934b9f29219e676827dabab73fe9d9a0b5f8525c0525e74a78d7';

  private countdown: ReturnType<typeof setTimeout>;

  constructor() { }

  public showToast(status: string, msg: string, link: string = null) {
    // Close any existing toast before displaying a new one
    this.closeToast();

    // Reset and display the new toast after a short delay
    setTimeout(() => {
      this.toastrStatus = status;
      this.toastrMessage = msg;
      this.link = link;

      const t = document.getElementById('toast');
      const toastTimer = document.getElementById('timer');

      t?.classList.remove('panel-hidden');
      toastTimer?.classList.add('timer-animation');

      // Clear the previous countdown if it's still running
      clearTimeout(this.countdown);

      // Set the countdown to close the toast after 10 seconds
      this.countdown = setTimeout(() => {
        this.closeToast();
      }, 10000);
    }, 500);
  }

  protected closeToast() {
    const t = document.getElementById('toast');
    const toastTimer = document.getElementById('timer');

    // Hide the toast immediately
    t?.classList.add('panel-hidden');

    // Stop the timer animation
    toastTimer?.classList.remove('timer-animation');

    // Clear any running countdown timers
    clearTimeout(this.countdown);

    // Reset the message and link to their default states
    this.link = null;
    this.toastrMessage = '';
    this.toastrStatus = 'Info';
  }
}
