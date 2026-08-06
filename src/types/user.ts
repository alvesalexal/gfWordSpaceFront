export interface User {
  id: string;
  name?: string;
  username?: string;
  avatar?: string;
  email?: string;
  role?: string;
  phone?: string;
  needsUsername?: boolean;

  [key: string]: unknown;
}
