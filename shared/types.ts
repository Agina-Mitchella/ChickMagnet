export * from '../src/types';

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code?: string;
    message: string;
    details?: any;
  };
  retryAfter?: number;
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'STAFF' | 'BUYER' | 'KEEPER';
    avatarEmoji?: string;
  };
  accessToken: string;
  refreshToken?: string;
}

export interface SecurityIncident {
  id: string;
  ip: string;
  type: string;
  endpoint: string;
  timestamp: string;
}

export interface SystemAuditLog {
  id: string;
  event: string;
  user: string;
  details: string;
  ip: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  timestamp: string;
}
