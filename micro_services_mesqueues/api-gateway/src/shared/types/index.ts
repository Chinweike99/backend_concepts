export interface NotificationRequest {
  notification_id: string;
  user_id: string;
  type: 'email' | 'push';
  template_id: string;
  variables: Record<string, string>;
  priority: 'low' | 'medium' | 'high';
}

export interface NotificationResponse {
  success: boolean;
  data?: unknown;
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

export interface User {
  user_id: string;
  email: string;
  push_token?: string;
  notification_preferences: NotificationPreferences;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  language: string;
}

export interface NotificationStatus {
  notification_id: string;
  status: 'pending' | 'processing' | 'sent' | 'failed';
  service: 'email' | 'push';
  retry_count: number;
  last_attempt?: Date;
  error_message?: string;
}