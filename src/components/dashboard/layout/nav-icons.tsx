import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { BookOpen as BookOpenIcon } from '@phosphor-icons/react/dist/ssr/BookOpen';
import { ChartPie as ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { CheckSquare as CheckSquareIcon } from '@phosphor-icons/react/dist/ssr/CheckSquare';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { PlugsConnected as PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { Timer as TimerIcon } from '@phosphor-icons/react/dist/ssr/Timer';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';

export const navIcons = {
  'book-open': BookOpenIcon,
  'chart-pie': ChartPieIcon,
  'check-square': CheckSquareIcon,
  'gear-six': GearSixIcon,
  'plugs-connected': PlugsConnectedIcon,
  timer: TimerIcon,
  'x-square': XSquare,
  user: UserIcon,
  users: UsersIcon,
} as Record<string, Icon>;
