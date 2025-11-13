import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    selector: 'app-reservas',
    standalone: true,
    imports: [CommonModule, FormsModule, InputTextModule],
    templateUrl: './reservas.html',
    styleUrl: './reservas.scss'
})
export class ReservasComponent {
    codigoPatrimonio: string = '';
}
