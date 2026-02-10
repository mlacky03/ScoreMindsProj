import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../core/auth/auth.service';
import { FormComponent } from '../../components/form/form.component';
import { InputFieldComponent } from '../../components/input-field/input-field.component';
import { ImageUploaderComponent } from '../../components/image-uploader/image-uploader.component';

import { UserCreateDto } from '../../feature/users/data/user-create.dto';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormComponent, InputFieldComponent, ImageUploaderComponent, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  loading = false;
  error: string | null = null;

  private selectedFile: File | null = null;

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  onInputString(
    control: 'username' | 'email' | 'password' | 'confirmPassword',
    v: string | number
  ) {
    const val = typeof v === 'number' ? String(v) : v;
    this.form.controls[control].setValue(val);
    this.form.controls[control].markAsDirty();
  }

  onSubmit({ username, email, password }: UserCreateDto, confirmPassword: string) {
    if (this.loading) return;

    if (password !== confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.error = null;

    this.authService.register({ username, email, password }, this.selectedFile ?? undefined)
      .subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.error =
            err?.friendlyMessage ||
            (Array.isArray(err?.error?.message) ? err.error.message.join(', ') : err?.error?.message) ||
            err?.message ||
            'Registration failed';
          this.loading = false;
        }
      });
  }

  onAvatarSelected(file: File) {
    this.selectedFile = file;
  }

  onAvatarError(message: string) {
  }
}