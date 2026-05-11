import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { UserService } from '../user.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    // Formulaire de création
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['USER', Validators.required]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe((data: any) => {
      this.users = data;
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
      email: [user.email, [Validators.required, Validators.email]],
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
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => this.showToast = false, 3000);
  }

  // --- ACTIONS CRUD ---

  createUser() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.userService.addUser(this.form.value).subscribe({
      next: (res: any) => {

        if (!res.success) {
          this.triggerToast(res.message, 'error');
          return;
        }

        this.users = [...this.users, res.data]; // 👈 IMPORTANT
        this.closeModal();
        this.triggerToast(res.message, 'success');
      },
      error: () => this.triggerToast('Erreur lors de la création')
    });
  }

  // Étape 1 : Ouvrir le pop-up de confirmation
  confirmDelete(user: any) {

    this.userToDeleteId = user.id;

    this.confirmAction = 'delete';

    this.showConfirmModal = true;
  }


  updateUser() {

    if (this.selectedUserId === null || this.editForm.invalid) {
      return;
    }

    const raw = this.editForm.getRawValue();

    const payload: any = {
      email: raw.email,
      role: raw.role
    };

    if (raw.oldPassword && raw.newPassword) {

      if (raw.newPassword !== raw.confirmPassword) {
        this.triggerToast("Les mots de passe ne correspondent pas", "error");
        return;
      }

      payload.oldPassword = raw.oldPassword;
      payload.newPassword = raw.newPassword;
    }

    this.pendingUpdateData = payload;

    this.confirmAction = 'update';
    this.showConfirmModal = true;
  }
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

              this.users = this.users.map(u =>
                u.id === res.data.id ? res.data : u
              );

              this.closeModal();
              this.triggerToast(res.message, 'success');
            },

            error: (err) => {

              const msg =
                err.error?.message ||
                'Erreur serveur';

              this.triggerToast(msg, 'error');
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

          next: (updatedUser: any) => {

            this.users = this.users.map(u =>
              u.id === updatedUser.id
                ? updatedUser
                : u
            );

            this.closeModal();

            this.triggerToast('Utilisateur mis à jour');
          },

          error: (err) => {

            const backend = err.error;

            if (!backend?.success) {
              this.triggerToast(backend.message || 'Erreur serveur', 'error');
              return;
            }

            this.triggerToast('Erreur inconnue', 'error');
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