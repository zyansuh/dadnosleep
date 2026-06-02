export type UserRole = 'user' | 'admin';

export interface PublicUser {
  id:    string;
  email: string;
  role:  UserRole;
}

export interface StoredUser extends PublicUser {
  passwordHash: string;
  createdAt:    string;
}

export interface JwtPayload extends PublicUser {
  iat?: number;
  exp?: number;
}
