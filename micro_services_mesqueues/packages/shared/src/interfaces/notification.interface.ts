export interface NotificationRequest {
  user_id: string;
  type: 'email' | 'push';
  template_id: string;
  variables: Record<string, any>;
  idempotency_key: string;
}

export interface NotificationResponse {
  success: boolean;
  data?: any;
  error?: string;
  message: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
  idempotency_key: string;
  user_id: string;
}

export interface PushMessage {
  device_token: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  idempotency_key: string;
  user_id: string;
}