'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { CaretUpDown as CaretUpDownIcon } from '@phosphor-icons/react/dist/ssr/CaretUpDown';

import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { useUser } from '@/hooks/use-user';
import { Logo } from '@/components/core/logo';

import { navItems } from './config';
import { navIcons } from './nav-icons';

const sidebarColors = {
  dark: {
    '--SideNav-bg': '#090a0b',
    '--SideNav-color': '#ffffff',
    '--SideNav-border': '#32383e',
    '--NavItem-color': '#cdd7e1',
    '--NavItem-hover-bg': 'rgba(255, 255, 255, 0.04)',
    '--NavItem-disabled-color': '#636b74',
    '--NavItem-icon-color': '#9fa6ad',
    '--NavItem-icon-disabled-color': '#555e68',
    '--Selector-bg': '#090a0b',
  },
  light: {
    '--SideNav-bg': '#ffffff',
    '--SideNav-color': '#212636',
    '--SideNav-border': '#dcdfe4',
    '--NavItem-color': '#565e73',
    '--NavItem-hover-bg': 'rgba(0, 0, 0, 0.04)',
    '--NavItem-disabled-color': '#8a94a6',
    '--NavItem-icon-color': '#667085',
    '--NavItem-icon-disabled-color': '#b3b9c6',
    '--Selector-bg': '#f9fafb',
  },
} as const;

export function SideNav(): React.JSX.Element {
  const pathname = usePathname();
  const { user } = useUser();
  const { palette } = useTheme();

  const isDark = palette.mode === 'dark';
  const c = isDark ? sidebarColors.dark : sidebarColors.light;

  const filteredItems = navItems.filter((item) => !item.roles || item.roles.includes(user?.role ?? ''));

  return (
    <Box
      sx={{
        '--NavItem-active-background': 'var(--mui-palette-primary-main)',
        '--NavItem-active-color': 'var(--mui-palette-primary-contrastText)',
        ...c,
        bgcolor: 'var(--SideNav-bg)',
        borderRight: '1px solid var(--SideNav-border)',
        color: 'var(--SideNav-color)',
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        height: '100%',
        left: 0,
        maxWidth: '100%',
        position: 'fixed',
        scrollbarWidth: 'none',
        top: 0,
        width: 'var(--SideNav-width)',
        zIndex: 'var(--SideNav-zIndex)',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      <Stack spacing={2} sx={{ p: 3 }}>
        <Box component={RouterLink} href={paths.home} sx={{ display: 'inline-flex' }}>
          <Logo color={isDark ? 'light' : 'dark'} height={32} width={122} />
        </Box>
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: 'var(--Selector-bg)',
            border: '1px solid var(--SideNav-border)',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            p: '4px 12px',
          }}
        >
          <Box sx={{ flex: '1 1 auto' }}>
            <Typography color="var(--NavItem-icon-color)" variant="body2">
              Estudos Biblicos
            </Typography>
            <Typography color="inherit" variant="subtitle1">
              WordSpace
            </Typography>
          </Box>
          <CaretUpDownIcon />
        </Box>
      </Stack>
      <Divider sx={{ borderColor: 'var(--SideNav-border)' }} />
      <Box component="nav" sx={{ flex: '1 1 auto', p: '12px' }}>
        {renderNavItems({ pathname, items: filteredItems })}
      </Box>
      <Divider sx={{ borderColor: 'var(--SideNav-border)' }} />
    </Box>
  );
}

function renderNavItems({ items = [], pathname }: { items?: NavItemConfig[]; pathname: string }): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    const { key, ...item } = curr;

    acc.push(<NavItem key={key} pathname={pathname} {...item} />);

    return acc;
  }, []);

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

interface NavItemProps extends Omit<NavItemConfig, 'items'> {
  pathname: string;
}

function NavItem({ disabled, external, href, icon, matcher, pathname, title }: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? navIcons[icon] : null;

  return (
    <li>
      <Box
        {...(href
          ? {
              component: external ? 'a' : RouterLink,
              href,
              target: external ? '_blank' : undefined,
              rel: external ? 'noreferrer' : undefined,
            }
          : { role: 'button' })}
        sx={{
          alignItems: 'center',
          borderRadius: 1,
          color: 'var(--NavItem-color)',
          cursor: 'pointer',
          display: 'flex',
          flex: '0 0 auto',
          gap: 1,
          p: '6px 16px',
          position: 'relative',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          '&:hover': { bgcolor: active ? undefined : 'var(--NavItem-hover-bg)' },
          ...(disabled && {
            color: 'var(--NavItem-disabled-color)',
            cursor: 'not-allowed',
          }),
          ...(active && {
            bgcolor: 'var(--NavItem-active-background)',
            color: 'var(--NavItem-active-color)',
          }),
        }}
      >
        <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
          {Icon ? (
            <Icon
              fill={active ? 'var(--NavItem-active-color)' : 'var(--NavItem-icon-color)'}
              fontSize="var(--icon-fontSize-md)"
              weight={active ? 'fill' : undefined}
            />
          ) : null}
        </Box>
        <Box sx={{ flex: '1 1 auto' }}>
          <Typography
            component="span"
            sx={{ color: 'inherit', fontSize: '0.875rem', fontWeight: 500, lineHeight: '28px' }}
          >
            {title}
          </Typography>
        </Box>
      </Box>
    </li>
  );
}
