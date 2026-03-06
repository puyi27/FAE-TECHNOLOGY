// types.ts - Definiciones de tipos TypeScript

export interface Category {
  id_category: number;
  name: string;
  description?: string | null;
  icon?: string | null;
}

export interface Presence {
  id_presence: number;
  date: string;
  id_user: number;
  id_category: number;
  categories?: Category;
}

export interface User {
  id_user: number;
  alias: string;
  full_name: string;
  description?: string | null;
  work: string;
  email?: string | null;
  role?: string | null;
  phoneNumber?: string | null;
  avatar?: string | null;
  presences: Presence[];
}