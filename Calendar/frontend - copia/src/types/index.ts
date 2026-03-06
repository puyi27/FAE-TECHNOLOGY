export interface WorkCategory {
  id: string;
  name: string;
  icon: string;
  requiresLoc?: boolean;
}

export interface Presence {
  id: string;
  date: string;
  categoryId: string;
  category: WorkCategory;
  location?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  presences: Presence[];
}