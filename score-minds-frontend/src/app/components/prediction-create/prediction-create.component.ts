// import { Component, inject, signal } from '@angular/core';
// import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
// import { Store } from '@ngrx/store';
// import { FormBuilder } from '@angular/forms';
// import { CreateUserPredictionDto } from '../../feature/predictions/personal-predictions/data/create-p-prediction.dto';
// import { PersonalPredictionService } from '../../feature/predictions/personal-predictions/personal-predictions.service';
// import { FormComponent } from '../form/form.component';
// import { InputFieldComponent } from '../input-field/input-field.component';
// import { NgFor, NgIf } from '@angular/common';
// import { selectUser } from '../../core/auth/state/auth.selectors';
// import { Router } from '@angular/router';


// @Component({
//   selector: 'app-prediction-create',
//   standalone: true,
//   imports: [FormComponent, InputFieldComponent, NgFor, NgIf],
//   templateUrl: './prediction-create.component.html',
//   styleUrl: './prediction-create.component.scss',
// })
// export class PredictionCreateComponent {
//   private fb = inject(FormBuilder);
//   private router = inject(Router);
//   private expenseService = inject(PersonalPredictionService);
//   private state = inject(Store);

//   loading = false;
//   error: string | null = null;

//   type = signal<'HOME' | 'AWAY' | 'DRAW'>('HOME');
  


//   form = this.fb.group({
//     homeScore: ['', []],
//     awayScore: [0, []],
//     winner: [this.type, []],
//   });

//   ngOnInit() {
//     this.state.select(selectUser).subscribe((user) => {
//       if (user) {
        
//       }
//     });
//   }

//   onInputString(control: 'title', v: string | number) {
//     const val = typeof v === 'number' ? String(v) : v;
//     this.form.controls[control].setValue(val);
//     this.form.controls[control].markAsDirty();
//   }

//   onInputNumber(control: 'amount', v: string | number) {
//     const val = typeof v === 'number' ? v : parseFloat(v);
//     this.form.controls[control].setValue(val);
//     this.form.controls[control].markAsDirty();
//   }

//   onToggleMember(member: GroupMemberBaseDto, checked: boolean) {
//     this.selectedMember = checked
//       ? member
//       : this.selectedMember?.id === member.id
//       ? null
//       : this.selectedMember;
//   }
//   onSelectType(type: 'expense' | 'transfer') {
//     this.type.set(type);
//     if (type === 'expense') this.selectedMember = null;
//     this.form.controls.txnType.markAsDirty();
//   }

//   onSubmit() {
//     if (this.loading || !this.group) return;
//     this.loading = true;
//     this.error = null;

//     const expenseData: CreateExpenseDto = {
//       groupId: this.group.id,
//       title: this.form.value.title ?? '',
//       amount: this.form.value.amount ?? 0,
//       dateIncurred: new Date().toISOString().split('T')[0],
//       paidToId: this.selectedMember?.id ?? null,
//       txnType: this.type(),
//     };

//     if (expenseData.txnType === 'transfer' && !expenseData.paidToId) {
//       this.error = 'Please select a member to transfer to.';
//       this.loading = false;
//       return;
//     }

//     this.expenseService.createExpense(expenseData).subscribe({
//       next: () => {
//         this.dialogRef.close('added');
//       },
//       error: (err) => {
//         this.error =
//           err?.friendlyMessage ||
//           (Array.isArray(err?.error?.message)
//             ? err.error.message.join(', ')
//             : err?.error?.message) ||
//           'An error occurred while creating the expense';
//         this.loading = false;
//       },
//     });
//   }

//   onCancel() {
//     this.dialogRef.close('cancel');
//   }

//   setType(newType: 'expense' | 'transfer') {
//     this.type.set(newType);
// }
// }