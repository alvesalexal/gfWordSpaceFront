export interface User {
  id: string;
  name?: string;
  avatar?: string;
  email?: string;
  role?: string;
  phone?: string;

  [key: string]: unknown;
}
