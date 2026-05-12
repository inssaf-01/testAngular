import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, FormsModule } from '@angular/forms';
import { UserService } from '../user.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './list.html',
  styleUrls: ['./list.css'],
})
export class ListUserComponent implements OnInit {
  users: any[] = [];
  form: FormGroup;
  editForm!: FormGroup; // Utilisation du definite assignment assertion

  // États de l'interface
  openCreateModalFlag = false;
  openEditModalFlag = false;
  showConfirmModal = false;
  showToast = false;
  confirmAction: 'delete' | 'update' | null = null;
  pendingUpdateData: any = null;

  // Variables de gestion
  selectedUserId: number | null = null;
  toastMessage = '';
  userToDeleteId: number | null = null;
  toastType: 'success' | 'error' = 'success';
  toasts: any[] = []; // tableau des toasts 
  // recherche & filtrage 
  filteredUsers: any[] = [];
  searchTerm: string = '';
  selectedRole: string = 'ALL';
  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    // Formulaire de création
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      login: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['USER', Validators.required]
    });
  }
  // demarage 
  ngOnInit() {
    console.log("LIST INIT");
    this.loadUsers();

  }
  //chargement des users
  loadUsers() {
    console.log("CALL API GET USERS");

    this.userService.getUsers().subscribe({
      next: (data: any) => {
        this.users = data || [];
        this.filteredUsers = [...this.users]; // sécurité
        this.applyFilters();

        // 🔥 FORCE UI REFRESH
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }
  //filters 
  applyFilters() {
    const term = (this.searchTerm || '').toLowerCase();

    this.filteredUsers = this.users.filter(user => {

      const roleMatch =
        this.selectedRole === 'ALL' || user.role === this.selectedRole;

      const searchMatch =
        (user.username || '').toLowerCase().includes(term) ||
        (user.login || '').toLowerCase().includes(term);

      return roleMatch && searchMatch;
    });
  }
  toggleRole(user: any) {

    const newRole = user.role === 'USER' ? 'ADMIN' : 'USER';

    this.userService.updateUser(user.id, { role: newRole })
      .subscribe({

        next: (res: any) => {

          if (!res.success) {
            this.triggerToast(res.message, 'error');
            return;
          }

          // UPDATE UI DIRECT
          this.users = this.users.map(u =>
            u.id === user.id ? { ...u, role: newRole } : u
          );
           this.loadUsers();

          this.triggerToast('Role updated', 'success');
        },

        error: () => {
          this.triggerToast('Server error', 'error');
        }

      });
  }

  // --- GESTION DES MODALS ---

  openCreateModal() {
    this.openCreateModalFlag = true;
  }

  openEditModal(user: any) {
    this.selectedUserId = user.id;
    this.editForm = this.fb.group({
      username: [{ value: user.username, disabled: true }],
      login: [user.login, [Validators.required, Validators.email]],
      role: [user.role, Validators.required],

      oldPassword: [''],
      newPassword: ['', [Validators.minLength(6)]],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
    this.openEditModalFlag = true;
  }

  closeModal() {

    this.openCreateModalFlag = false;
    this.openEditModalFlag = false;
    this.showConfirmModal = false;

    this.confirmAction = null;

    this.pendingUpdateData = null;

    this.userToDeleteId = null;

    this.form.reset({
      role: 'USER'
    });

    this.selectedUserId = null;
  }

  // --- GESTION DES TOASTS ---

  triggerToast(message: string, type: 'success' | 'error' = 'success') {

    const toast = {
      id: Date.now(),
      message,
      type
    };

    this.toasts.push(toast);

    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== toast.id);
    }, 3000);
  }


  // --- ACTIONS CRUD ---

  createUser() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.userService.addUser(this.form.value)
      .subscribe({

        next: (res: any) => {

          // SUCCESS FALSE
          if (!res.success) {
            this.triggerToast(res.message, 'error');
            return;
          }

          // AJOUT DIRECT DANS LA LISTE
          this.closeModal();

          this.triggerToast(res.message, 'success');
        },

        error: (err) => {

          const backend = err.error;

          // MULTIPLE ERRORS
          if (backend?.messages?.length) {

            backend.messages.forEach((msg: string, index: number) => {

              setTimeout(() => {
                this.triggerToast(msg, 'error');
              }, index * 500);

            });

            return;
          }

          // SINGLE ERROR
          this.triggerToast(
            backend?.message || 'Erreur serveur',
            'error'
          );
        }
      });
  }

  // Étape 1 : Ouvrir le pop-up de confirmation
  confirmDelete(user: any) {

    this.userToDeleteId = user.id;

    this.confirmAction = 'delete';

    this.showConfirmModal = true;
  }
  // fct abondonnee
  //updateUser() {

  //   if (this.selectedUserId === null || this.editForm.invalid) {
  //     return;
  //   }

  //   const raw = this.editForm.getRawValue();

  //   const payload: any = {
  //     login: raw.login,
  //     role: raw.role
  //   };

  //   if (raw.oldPassword && raw.newPassword) {

  //     if (raw.newPassword !== raw.confirmPassword) {
  //       this.triggerToast("Les mots de passe ne correspondent pas", "error");
  //       return;
  //     }

  //     payload.oldPassword = raw.oldPassword;
  //     payload.newPassword = raw.newPassword;
  //   }

  //   this.pendingUpdateData = payload;

  //   this.confirmAction = 'update';
  //   this.showConfirmModal = true;
  // }
  passwordMismatch(): boolean {
    const raw = this.editForm.getRawValue();
    return raw.newPassword !== raw.confirmPassword;
  }
  executeConfirmedAction() {

    // ================= DELETE =================
    if (this.confirmAction === 'delete') {

      if (this.userToDeleteId) {

        this.userService.deleteUser(this.userToDeleteId)
          .subscribe({

            next: (res: any) => {

              if (!res.success) {
                this.triggerToast(res.message, 'error');
                return;
              }

              // REMOVE USER
              this.loadUsers();
              this.closeModal();

              this.triggerToast(res.message, 'success');
            },

            error: (err) => {

              const backend = err.error;

              this.triggerToast(
                backend?.message || 'Erreur serveur',
                'error'
              );
            }
          });
      }
    }


    // ================= UPDATE =================
    if (this.confirmAction === 'update') {

      this.userService.updateUser(
        this.selectedUserId!,
        this.pendingUpdateData
      )
        .subscribe({

          next: (res: any) => {

            // ERROR FROM API
            if (!res.success) {
              this.triggerToast(res.message, 'error');
              return;
            }
            // UPDATE FRONT LIST
            this.loadUsers();
            this.closeModal();
            this.triggerToast(res.message, 'success');
          },

          error: (err) => {

            const backend = err.error;

            this.triggerToast(
              backend?.message || 'Erreur serveur',
              'error'
            );
          }
        });
    }
  }
  passwordMatchValidator(group: AbstractControl) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }
}