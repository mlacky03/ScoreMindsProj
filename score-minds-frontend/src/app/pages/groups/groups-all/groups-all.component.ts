import { Component, Inject, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { map, distinctUntilChanged } from 'rxjs/operators';

import { GroupListComponent } from '../../../components/group-list/group-list.component';
import { GroupService } from '../../../feature/groups/group.service';
import { GroupBaseDto } from '../../../feature/groups/data/group-base.dto';
import { GroupViewComponent } from '../../../components/group-view/group-view.component';
import { GroupCreateComponent } from '../group-create/group-create.component';
import { Subscription } from 'rxjs';
import { SocketService } from '../../../core/services/socket.service';


@Component({
  selector: 'app-groups-all',
  standalone: true,
  imports: [NgIf, GroupListComponent, GroupViewComponent, GroupCreateComponent],
  templateUrl: './groups-all.component.html',
  styleUrl: './groups-all.component.scss'
})
export class GroupsAllComponent implements OnInit, OnDestroy {
  private groupsService = inject(GroupService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private socketService = inject(SocketService)

  groups = signal<GroupBaseDto[]>([]);
  selectedGroupId = signal<number | null>(null);
  creatingGroup = signal<boolean>(true);

  private subs = new Subscription();  

  ngOnInit() {
    this.subs.add(
      this.socketService.onAddedToGroup().subscribe((data) => {
        console.log(`Dodat si u grupu: ${data.groupId}`);


        this.onAddMemebers(data.groupId);

      })
    );

    this.groupsService.searchGroups().subscribe({
      next: (gs) => this.groups.set(gs),
      error: (err) => {
      }
    });

    this.route.paramMap.pipe(
      map(pm => pm.get('id') ?? pm.get('groupId')),
      map(id => id ? Number(id) : null),
      distinctUntilChanged(),
    ).subscribe(id => {
      this.selectedGroupId.set(id);
      if (id) this.creatingGroup.set(false);
    });
  }

  onAddMemebers(groupId: number) {
    this.groupsService.getGroupById(groupId).subscribe({
      next: (gs) => {
        const g: GroupBaseDto = {
          id: gs.id,
          name: gs.name,
          profileImageUrl: gs.profileImageUrl,
          points: gs.points,
          ownerId: gs.owner.id
        }
        this.groups.update((currentGroups) => {
          const alreadyExists = currentGroups.some(group => group.id === g.id);
          
          if (alreadyExists) {
            return currentGroups; 
          }

          return [...currentGroups, g]; 
        });
      },
      error: (err) => {
        console.error('Greška pri dohvatanju detalja o novoj grupi:', err);
      }
    })
  }

  onSelect(groupId: number) {
    if (!groupId || this.selectedGroupId() === groupId) return;
    this.creatingGroup.set(false);
    this.router.navigate(['/groups', groupId]);
  }

  onCreateGroup() {
    this.creatingGroup.set(true);
    this.router.navigate(['/groups']);
  }

  openUpdateDialog() { }
  goToMembers(_id: number) { }
  openAddExpense(_id: number) { }
  openGroupSettings(_id: number) { }

  ngOnDestroy() {
  this.subs.unsubscribe(); 
}
}