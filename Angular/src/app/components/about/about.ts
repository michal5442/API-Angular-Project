import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-about',
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {

}