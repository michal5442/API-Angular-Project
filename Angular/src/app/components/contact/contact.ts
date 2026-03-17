import { Component, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
  encapsulation: ViewEncapsulation.None
})
export class Contact {
  name = signal('');
  email = signal('');
  subject = signal('');
  message = signal('');
  submitted = signal(false);

  onSubmit() {
    if (this.name() && this.email() && this.message()) {
      console.log('Form submitted:', {
        name: this.name(),
        email: this.email(),
        subject: this.subject(),
        message: this.message()
      });
      
      this.name.set('');
      this.email.set('');
      this.subject.set('');
      this.message.set('');
      
      this.submitted.set(true);
      
      setTimeout(() => {
        this.submitted.set(false);
      }, 3000);
    }
  }
}