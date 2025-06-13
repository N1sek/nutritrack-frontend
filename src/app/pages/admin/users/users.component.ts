import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Modal, Toast } from 'bootstrap';
import { AdminService, AdminUser } from '../../../core/user/admin.service';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [ CommonModule, FormsModule, NavbarComponent ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: AdminUser[] = [];
  loading = false;

  pageSize = 10;
  currentPage = 1;

  searchTerm = '';
  filterRole = '';

  roles = ['USER','MODERATOR','ADMIN'];

  selectedUser: AdminUser | null = null;
  actionType: 'toggle' | 'delete' = 'delete';
  @ViewChild('confirmModal') confirmModalRef!: ElementRef<HTMLDivElement>;
  @ViewChild('toast') toastRef!: ElementRef<HTMLDivElement>;
  toastMessage = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.loading = true;
    this.adminService.listUsers().subscribe({
      next: list => {
        this.users = list;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  get filteredUsers(): AdminUser[] {
    return this.users
      .filter(u => {
        const term = this.searchTerm.toLowerCase();
        return !term
          || u.nickname.toLowerCase().includes(term)
          || u.email.toLowerCase().includes(term);
      })
      .filter(u => !this.filterRole || u.role === this.filterRole);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedUsers(): AdminUser[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  goToPage(n: number): void {
    if (n < 1 || n > this.totalPages) return;
    this.currentPage = n;
  }

  confirmAction(u: AdminUser, action: 'toggle' | 'delete'): void {
    this.selectedUser = u;
    this.actionType = action;
    new Modal(this.confirmModalRef.nativeElement).show();
  }

  onConfirm(): void {
    if (!this.selectedUser) return;
    const u = this.selectedUser;
    const modal = Modal.getInstance(this.confirmModalRef.nativeElement)!;

    if (this.actionType === 'toggle') {
      this.adminService.toggleEnabled(u.id).subscribe(() => {
        u.isActive = !u.isActive;
        this.showToast(`Usuario ${u.nickname} ${u.isActive ? 'activado' : 'desactivado'}.`);
      });
    } else {
      this.adminService.deleteUser(u.id).subscribe(() => {
        this.users = this.users.filter(x => x.id !== u.id);
        this.showToast(`Usuario ${u.nickname} eliminado.`);
      });
    }

    modal.hide();
  }

  changeRole(u: AdminUser): void {
    this.adminService.updateRole(u.id, u.role).subscribe(() => {
      this.showToast(`Rol de ${u.nickname} cambiado a ${u.role}.`);
    });
  }

  private showToast(msg: string): void {
    this.toastMessage = msg;
    const toastEl = this.toastRef.nativeElement;
    const toast = new Toast(toastEl);
    toast.show();
  }
}
