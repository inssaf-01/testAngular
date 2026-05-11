import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
      username: [{ value: user.username, disabled: true }], // On désactive pour le design "readonly"
      email: [user.email, [Validators.required, Validators.email]],
      role: [user.role, Validators.required],
      oldPassword: [''],
      newPassword: [''],
      confirmPassword: ['']
    });
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

  triggerToast(message: string) {
    this.toastMessage = message;
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
      next: (newUser: any) => {
        this.users = [...this.users, newUser];
        this.closeModal();
        this.triggerToast('Utilisateur ajouté avec succès ! ✨');
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

    // 1. check password confirm
    if (raw.newPassword || raw.oldPassword) {

      if (raw.newPassword !== raw.confirmPassword) {
        this.triggerToast('Les mots de passe ne correspondent pas');
        return;
      }

      if (!raw.oldPassword) {
        this.triggerToast('Ancien mot de passe requis');
        return;
      }
    }

    this.pendingUpdateData = {
      email: raw.email,
      role: raw.role,
      oldPassword: raw.oldPassword,
      newPassword: raw.newPassword
    };

    this.confirmAction = 'update';
    this.showConfirmModal = true;
  }
  executeConfirmedAction() {

    // ================= DELETE =================
    if (this.confirmAction === 'delete') {

      if (this.userToDeleteId) {

        this.userService.deleteUser(this.userToDeleteId)
          .subscribe({

            next: () => {

              this.users = this.users.filter(
                u => u.id !== this.userToDeleteId
              );

              this.userToDeleteId = null;
              this.confirmAction = null;
              this.showConfirmModal = false;

              this.closeModal();

              this.triggerToast('Utilisateur supprimé');
            },

            error: () => {
              this.triggerToast('Erreur suppression');
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

            const msg =
              err.error?.message ||
              'Erreur mise à jour';

            this.triggerToast(msg);
          }
        });
    }
  }
}