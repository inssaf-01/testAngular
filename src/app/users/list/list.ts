import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, FormsModule } from '@angular/forms';
import { UserService } from '../user.service';
import { ChangeDetectorRef } from '@angular/core';
import { ImageService } from '../../profile/image.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './list.html',
  styleUrls: ['./list.css'],
})
export class ListUserComponent implements OnInit {
  users: any[] = [];
  form!: FormGroup;
  // editForm!: FormGroup; // Utilisation du definite assignment assertion

  page = 1;
  limit = 8;
  total = 0;
  roles: any[] = [];

  // États de l'interface
  openCreateModalFlag = false;
  openEditModalFlag = false;
  showConfirmModal = false;
  showToast = false;
  confirmAction: 'delete' | 'updateUser' | 'updateStatus' | null = null;
  pendingUpdateData: any = null;
  pendingStatusUpdate: any = null;

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
  selectedStatus: string = 'ALL';
  paginatedUsers: any[] = []; // users affichés dans la page
  protected readonly Math = Math;
  //Gestion des images 
  defaultImage = '/def_user.png';
  backendUrl = 'http://localhost:3000';
  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private imageService: ImageService
  ) { }

  initForm() {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      login: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role_id: [null, Validators.required]
    });
  }
  // demarage 
  ngOnInit() {
    this.initForm();
    this.filteredUsers = [];
    this.loadUsers();
    this.loadRoles();
  }
  //chargement des users avant pagination 
  // loadUsers() {
  //   console.log("CALL API GET USERS");

  //   this.userService.getUsers().subscribe({
  //     next: (data: any) => {

  //       this.users = (data || []).map((u: any) => ({
  //         ...u,
  //         imageUrl: u.id
  //           ? `${this.backendUrl}/users/profile-image/${u.id}?t=${Date.now()}`
  //           : this.defaultImage
  //       }));

  //       this.applyFilters(); // IMPORTANT
  //       this.cdr.detectChanges(); // FORCE UPDATE UI

  //     },
  //     error: (err) => console.error(err)
  //   });
  // }
  loadUsers() {
    // IMPORTANT : récupérer TOUS les users sans pagination backend
    this.userService.getUsers(1, 9999)
      .subscribe((res: any) => {
        console.log('res load users', res);

        this.users = (res.data || []).map((u: any) => ({
          ...u,
          imageUrl: u.id
            ? `${this.backendUrl}/users/profile-image/${u.id}?t=${Date.now()}`
            : this.defaultImage
        }));

        this.total = this.users.length;

        this.applyFilters();
        this.cdr.detectChanges();
      });
  }
  loadRoles() {
    this.userService.getRoles().subscribe((res: any) => {
      console.log('load roles : ', res);
      this.roles = res.data;
    });
  }
  //fct de changement de page 
  changePage(newPage: number) {
    if (newPage < 1) return;

    const maxPage = Math.ceil(this.total / this.limit);
    if (newPage > maxPage) return;

    this.page = newPage;

    this.applyFilters();
  }
  get totalPages(): number {
    return Math.ceil(this.total / this.limit);
  }

  toggleRole(user: any, roleId: number) {
    this.userService.updateUser(user.id, {
      role_id: Number(roleId)
    }).subscribe({
      next: () => {
        user.role_id = Number(roleId);

        // mise à jour visuelle immédiate
        user.role = this.roles.find(
          r => r.id === Number(roleId)
        )?.name;

        this.triggerToast('Rôle mis à jour', 'success');
      },

      error: (err) => {
        this.triggerToast(
          err.error?.message || 'Erreur lors de la mise à jour',
          'error'
        );
      }
    });
  }

  // --- GESTION DES MODALS ---

  openCreateModal() {
    this.openCreateModalFlag = true;
  }

  // openEditModal(user: any) {
  //   this.selectedUserId = user.id;
  //   this.editForm = this.fb.group({
  //     username: [{ value: user.username, disabled: true }],
  //     login: [user.login, [Validators.required, Validators.email]],
  //     role: [user.role, Validators.required],

  //     oldPassword: [''],
  //     newPassword: ['', [Validators.minLength(6)]],
  //     confirmPassword: ['']
  //   }, { validators: this.passwordMatchValidator });
  //   this.openEditModalFlag = true;
  // }

  closeModal() {

    this.openCreateModalFlag = false;
    this.openEditModalFlag = false;
    this.showConfirmModal = false;

    this.confirmAction = null;

    this.pendingUpdateData = null;

    this.userToDeleteId = null;
    this.pendingStatusUpdate = null;

    this.form.reset({
      role_id: 1
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

    const payload = {
      username: this.form.value.username,
      login: this.form.value.login,
      password: this.form.value.password,
      role_id: Number(this.form.value.role_id)
    };

    console.log("payload :", payload);

    this.userService.addUser(payload)
      .subscribe({
        next: (res: any) => {
          this.closeModal();
          this.loadUsers();
          this.triggerToast(res.message, 'success');
        },

        error: (err) => {
          console.log(err);

          this.triggerToast(
            err.error?.message || 'Erreur serveur',
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
  applyFilters() {
    const term = (this.searchTerm || '').toLowerCase();

    this.filteredUsers = this.users.filter(user => {
      const roleMatch =
        this.selectedRole === 'ALL' ||
        this.roles.find(r => r.id === user.role_id)?.name.toUpperCase() === this.selectedRole.toUpperCase();

      const statusMatch =
        this.selectedStatus === 'ALL' ||
        Number(user.status) === Number(this.selectedStatus);

      const searchMatch =
        (user.username || '').toLowerCase().includes(term) ||
        (user.login || '').toLowerCase().includes(term);

      return roleMatch && statusMatch && searchMatch;
    });

    // IMPORTANT
    this.total = this.filteredUsers.length;

    const maxPage = Math.ceil(this.total / this.limit);

    if (this.page > maxPage) {
      this.page = 1;
    }

    const start = (this.page - 1) * this.limit;
    const end = start + this.limit;

    this.paginatedUsers = this.filteredUsers.slice(start, end);
  }
  // passwordMismatch(): boolean {
  //   const raw = this.editForm.getRawValue();
  //   return raw.newPassword !== raw.confirmPassword;
  // }
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
    if (this.confirmAction === 'updateUser') {

      this.userService.updateUser(
        this.selectedUserId!,
        this.pendingStatusUpdate || this.pendingUpdateData
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
    if (this.confirmAction === 'updateStatus') {

      this.userService.updateUserStatus(
        this.selectedUserId!,
        this.pendingStatusUpdate
      )
        .subscribe({
          next: (res: any) => {
            if (!res.success) {
              this.triggerToast(res.message, 'error');
              return;
            }

            this.loadUsers();
            this.closeModal();
            this.triggerToast(res.message, 'success');
          },
          error: (err) => {
            this.triggerToast(err.error?.message || 'Erreur serveur', 'error');
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
  //Gestion des images 
  uploadUserImage(user: any, event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.imageService.uploadProfileImage(file, user.id)
      .subscribe(() => {

        // update local state DIRECT
        user.imageUrl =
          this.imageService.getProfileImage(user.id) + '?t=' + Date.now();

        this.cdr.detectChanges();
      });
  }
  //Gestion de status
  prepareStatusChange(user: any, newStatus: number) {
    this.selectedUserId = user.id;
    this.pendingStatusUpdate = newStatus;
    this.confirmAction = 'updateStatus';
    this.showConfirmModal = true;
  }
}