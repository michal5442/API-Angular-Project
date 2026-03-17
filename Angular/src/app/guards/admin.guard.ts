import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../services/admin.service';

export const adminGuard = () => {
  const adminService = inject(AdminService);
  const router = inject(Router);

  if (adminService.isAdmin()) {
    return true;
  }
  router.navigate(['/admin-login']);
  return false;
};
