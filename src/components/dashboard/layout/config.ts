import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'home', title: 'Home', href: paths.dashboard.home, icon: 'chart-pie' },
  { key: 'turmas', title: 'Turmas', href: paths.dashboard.turmas, icon: 'users', roles: ['teacher'] },
  { key: 'tarefas', title: 'Tarefas', href: paths.dashboard.tarefas, icon: 'check-square' },
  { key: 'leituras', title: 'Leituras', href: paths.dashboard.leituras, icon: 'book-open' },
  { key: 'provas', title: 'Provas', href: paths.dashboard.provas, icon: 'timer' },
  { key: 'conta', title: 'Conta', href: paths.dashboard.conta, icon: 'user' },
] satisfies NavItemConfig[];
