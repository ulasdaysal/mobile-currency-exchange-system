import { User } from '../../domain/entities/User';
import { IAuthRepository, LoginCredentials, RegisterData } from '../../domain/repositories/interfaces';
import { apiClient } from '../api/ApiClient';
import { ENDPOINTS } from '../api/endpoints';
import { UserDTO } from '../dto';
import { mapUserDTO } from '../mappers';
import { TokenStorage } from '../storage/TokenStorage';

export class AuthRepository implements IAuthRepository {
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await apiClient.post<UserDTO>(ENDPOINTS.AUTH.LOGIN, credentials);
    const user = mapUserDTO(response);
    
    apiClient.setToken(user.token);
    await TokenStorage.saveToken(user.token);
    await TokenStorage.saveUser(JSON.stringify(user));
    
    return user;
  }

  async register(data: RegisterData): Promise<User> {
    const response = await apiClient.post<UserDTO>(ENDPOINTS.AUTH.REGISTER, data);
    const user = mapUserDTO(response);
    
    apiClient.setToken(user.token);
    await TokenStorage.saveToken(user.token);
    await TokenStorage.saveUser(JSON.stringify(user));
    
    return user;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } finally {
      await this.clearSession();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const stored = await TokenStorage.getUser();
    if (!stored) return null;
    
    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  }

  async getStoredToken(): Promise<string | null> {
    return TokenStorage.getToken();
  }

  async clearSession(): Promise<void> {
    apiClient.setToken(null);
    await TokenStorage.clearAll();
  }

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword });
  }
}

export const authRepository = new AuthRepository();
