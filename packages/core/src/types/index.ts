// Multilingual content type - keys are locale codes
export type LocalizedContent = Record<string, string>;

// API response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Page types
export interface PageFormData {
  slug: string;
  template?: string;
  title: LocalizedContent;
  content: LocalizedContent;
  excerpt?: LocalizedContent;
  featuredImage?: string;
  seo?: Record<string, { title: string; description: string; ogImage?: string }>;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
  publishedAt?: string;
  scheduledAt?: string;
  parentId?: string;
  sortOrder?: number;
}

// Media types
export interface MediaUploadResult {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
}

// Site settings
export interface SiteTheme {
  primaryColor: string;
  secondaryColor: string;
  fonts: {
    heading: string;
    body: string;
  };
}

export interface SiteSettings {
  socialLinks?: Record<string, string>;
  analytics?: {
    googleAnalyticsId?: string;
  };
  [key: string]: unknown;
}
