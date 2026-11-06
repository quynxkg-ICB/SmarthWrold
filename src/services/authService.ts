import { User, RoleId } from '../types';
import contentData from '../data/contentData.json';

const AUTH_STORAGE_KEY = 'vtb_active_user_v2';

class AuthService {
  private currentUser: User;
  private allUsers: User[] = (contentData.users as unknown as User[]);

  constructor() {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch {
        this.currentUser = this.allUsers[0];
      }
    } else {
      // Default to Executive: Nguyễn Văn Thắng (Giám đốc Chi nhánh)
      this.currentUser = this.allUsers[0];
    }
  }

  public getCurrentUser(): User {
    return this.currentUser;
  }

  public getAllUsers(): User[] {
    return this.allUsers;
  }

  public switchUser(userId: string): User {
    const found = this.allUsers.find((u) => u.id === userId);
    if (found) {
      this.currentUser = found;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(found));
    }
    return this.currentUser;
  }

  public hasPermission(requiredRoles: RoleId[]): boolean {
    return requiredRoles.includes(this.currentUser.role);
  }
}

export const authService = new AuthService();
