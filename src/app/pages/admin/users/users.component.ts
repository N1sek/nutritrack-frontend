import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as bootstrap from 'bootstrap';
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
  roles = ['USER', 'MODERATOR', 'ADMIN'];

  // Paginación
  pageSize = 10;
  currentPage = 1;

  // Para confirmar acciones
  selectedUser: AdminUser | null = null;
  actionType: 'toggle' | 'delete' = 'delete';
  @ViewChild('confirmModal') confirmModalRef!: ElementRef<HTMLDivElement>;

  // Toast
  toastMessage = '';
  showToast = false;
  @ViewChild('toast') toastRef!: ElementRef<HTMLDivElement>;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.listUsers().subscribe({
      next: list => {
        this.users = list;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // Paginación: lista de páginas
  get totalPages(): number {
    return Math.ceil(this.users.length / this.pageSize);
  }
  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  // Usuarios a mostrar en la página actual
  get pagedUsers(): AdminUser[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.users.slice(start, start + this.pageSize);
  }
  goToPage(n: number): void {
    if (n < 1 || n > this.totalPages) return;
    this.currentPage = n;
  }

  // Abre el modal de confirmación
  confirmAction(u: AdminUser, action: 'toggle' | 'delete'): void {
    this.selectedUser = u;
    this.actionType = action;
    const modal = new bootstrap.Modal(this.confirmModalRef.nativeElement);
    modal.show();
  }

  // Ejecuta la acción tras confirmar
  onConfirm(modalInstance: bootstrap.Modal): void {
    if (!this.selectedUser) return;
    const u = this.selectedUser;
    if (this.actionType === 'toggle') {
      this.adminService.toggleEnabled(u.id).subscribe(() => {
        u.isActive = !u.isActive;      // actualizar en tabla
        this.showToastMessage(`Usuario ${u.nickname} ${u.isActive ? 'activado' : 'desactivado'}.`);
      });
    } else if (this.actionType === 'delete') {
      this.adminService.deleteUser(u.id).subscribe(() => {
        this.users = this.users.filter(x => x.id !== u.id);
        this.showToastMessage(`Usuario ${u.nickname} eliminado.`);
      });
    }
    modalInstance.hide();
  }

  changeRole(u: AdminUser): void {
    this.adminService.updateRole(u.id, u.role).subscribe(() => {
      this.showToastMessage(`Rol de ${u.nickname} cambiado a ${u.role}.`);
    });
  }

  // Toast helpers
  private showToastMessage(msg: string) {
    this.toastMessage = msg;
    this.showToast = true;
    const toastEl = this.toastRef.nativeElement;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
}
