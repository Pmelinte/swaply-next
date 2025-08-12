// src/types.ts
export type UUID = string;

export interface User {
  id: UUID;
  email: string;
  name?: string | null;
  avatar_url?: string | null;
  created_at?: string | null;
}

export interface ObjectItem {
  id: UUID;
  user_id: UUID;
  title: string;
  description: string;
  image_url?: string | null;
  category?: string | null;
  created_at?: string | null;
}

export interface Message {
  id: UUID;
  from_user_id: UUID;
  to_user_id: UUID;
  text: string;
  created_at?: string | null;
}

export interface Feedback {
  id: UUID;
  from_user_id: UUID;
  to_user_id: UUID;
  comment: string;
  created_at?: string | null;
}
