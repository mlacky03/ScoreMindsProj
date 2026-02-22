import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, NgFor, NgIf, AsyncPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, catchError, tap, finalize } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GroupBaseDto } from '../../feature/groups/data/group-base.dto';
import { GroupService } from '../../feature/groups/group.service';
import { UserBaseDto } from '../../feature/users/data/user-base.dto';



@Component({
  selector: 'app-group-search',
  standalone: true,
  imports: [
    // Angular
    CommonModule, NgIf, NgFor, AsyncPipe, ReactiveFormsModule,
    // Material
    MatFormFieldModule, MatInputModule, MatListModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule
  ],
  templateUrl: './group-search.component.html',
  styleUrl: './group-search.component.scss'
})
export class GroupSearchComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<GroupSearchComponent, number | 'cancel'>);
  //private data = inject<DialogData>(MAT_DIALOG_DATA);
  private groupPrediction= inject(GroupService)
  

  

  loading = false;
  error: string | null = null;

  searchCtrl = new FormControl<string>('', { nonNullable: true });
  results$!: Observable<GroupBaseDto[]>;

  selectedGroup: GroupBaseDto | null = null;

  ngOnInit(): void {
  this.results$ = this.searchCtrl.valueChanges.pipe(
    map(v => (v ?? '').trim()),
    debounceTime(350),
    distinctUntilChanged(),
    switchMap(term => {
      this.error = null;

      if (term.length < 2) {
        
        this.loading = false;
        this.selectedGroup = null;
        return of<GroupBaseDto[]>([]);
      }

      this.loading = true;
      return this.groupPrediction.searchGroups({ name: term }).pipe(
        map((res: any) => res as GroupBaseDto[]),
        catchError(err => {
          this.error =
            err?.friendlyMessage ||
            (Array.isArray(err?.error?.message) ? err.error.message.join(', ') : err?.error?.message) ||
            'Failed to search users';
          return of<GroupBaseDto[]>([]);
        }),
        finalize(() => (this.loading = false))
      );
    })
  );
}

  displayGroup(u: GroupBaseDto): string {
    return u?.name?? `${u.name ?? ''}`.trim();
  }

  onGroupSelected(g: GroupBaseDto) {
    this.selectedGroup = g;
    this.searchCtrl.setValue(this.displayGroup(g), { emitEvent: false });
  }

  onSubmit() {
    if (this.loading || !this.selectedGroup) return;

  this.dialogRef.close(this.selectedGroup.id);
  }

  onCancel() {
    this.dialogRef.close('cancel');
  }

  trackById = (_: number, u: GroupBaseDto) => u.id;
}