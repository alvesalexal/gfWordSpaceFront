'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { CaretLeft as CaretLeftIcon } from '@phosphor-icons/react/dist/ssr/CaretLeft';
import { CaretRight as CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';

import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { useUser } from '@/hooks/use-user';

import { navItems } from './config';
import { navIcons } from './nav-icons';
import LogoLeao from '@/components/LogoLeao';

const SIDEBAR_WIDTH_EXPANDED = 280;
const SIDEBAR_WIDTH_COLLAPSED = 72;

const sidebarColors = {
  dark: {
    '--SideNav-bg': 'var(--mui-palette-neutral-950)',
    '--SideNav-color': 'var(--mui-palette-common-white)',
    '--SideNav-border': 'var(--mui-palette-neutral-800)',
    '--NavItem-color': 'var(--mui-palette-neutral-400)',
    '--NavItem-hover-bg': 'rgba(255, 255, 255, 0.04)',
    '--NavItem-disabled-color': 'var(--mui-palette-neutral-600)',
    '--NavItem-icon-color': 'var(--mui-palette-neutral-500)',
    '--NavItem-icon-disabled-color': 'var(--mui-palette-neutral-700)',
    '--Selector-bg': 'var(--mui-palette-neutral-950)',
  },
  light: {
    '--SideNav-bg': 'var(--mui-palette-common-white)',
    '--SideNav-color': 'var(--mui-palette-neutral-900)',
    '--SideNav-border': 'var(--mui-palette-neutral-200)',
    '--NavItem-color': 'var(--mui-palette-neutral-500)',
    '--NavItem-hover-bg': 'rgba(0, 0, 0, 0.04)',
    '--NavItem-disabled-color': 'var(--mui-palette-neutral-400)',
    '--NavItem-icon-color': 'var(--mui-palette-neutral-500)',
    '--NavItem-icon-disabled-color': 'var(--mui-palette-neutral-300)',
    '--Selector-bg': 'var(--mui-palette-neutral-50)',
  },
} as const;

interface SideNavProps {
  isPinned: boolean;
  onTogglePin: () => void;
}

export function SideNav({ isPinned, onTogglePin }: SideNavProps): React.JSX.Element {
  const pathname = usePathname();
  const { user } = useUser();
  const { palette } = useTheme();

  const isDark = palette.mode === 'dark';
  const c = isDark ? sidebarColors.dark : sidebarColors.light;

  const filteredItems = navItems.filter((item) => !item.roles || item.roles.includes(user?.role ?? ''));

  const sidebarWidth = isPinned ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;

  const shadowLight = '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)';
  const shadowDark = '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)';
  const boxShadow = isDark ? shadowDark : shadowLight;

  return (
    <Box
      sx={{
        '--NavItem-active-background': 'var(--mui-palette-primary-main)',
        '--NavItem-active-color': 'var(--mui-palette-primary-contrastText)',
        ...c,
        bgcolor: 'var(--SideNav-bg)',
        borderRight: '1px solid var(--SideNav-border)',
        boxShadow,
        color: 'var(--SideNav-color)',
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        height: '100%',
        left: 0,
        maxWidth: '100%',
        overflow: 'visible',
        position: 'fixed',
        scrollbarWidth: 'none',
        top: 0,
        transition: 'width 0.3s ease',
        width: `${sidebarWidth}px`,
        zIndex: 'var(--SideNav-zIndex)',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: '16px',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Box
            component={RouterLink}
            href={paths.home}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            <LogoLeao width={isPinned ? 75 : 40} height={isPinned ? 75 : 40} />
          </Box>
        </Box>
        <Tooltip title={isPinned ? 'Recolher sidebar' : 'Expandir sidebar'} placement="right">
          <Button
            onClick={onTogglePin}
            size="small"
            variant="outlined"
            sx={{
              position: 'absolute',
              right: -16,
              top: '50%',
              transform: 'translateY(-50%)',
              minWidth: 0,
              p: '6px',
              borderRadius: '50%',
              bgcolor: 'var(--mui-palette-background-paper)',
              color: 'var(--NavItem-icon-color)',
              borderColor: 'var(--SideNav-border)',
              flexShrink: 0,
              zIndex: 10,
              '&:hover': {
                bgcolor: 'var(--mui-palette-background-paper)',
                color: 'var(--SideNav-color)',
                borderColor: 'var(--SideNav-color)',
              },
            }}
          >
            {isPinned ? (
              <CaretLeftIcon fontSize="var(--icon-fontSize-md)" />
            ) : (
              <CaretRightIcon fontSize="var(--icon-fontSize-md)" />
            )}
          </Button>
        </Tooltip>
      </Box>
      <Divider sx={{ borderColor: 'var(--SideNav-border)' }} />
      <Box component="nav" sx={{ flex: '1 1 auto', p: isPinned ? '12px' : '12px 8px' }}>
        {renderNavItems({ pathname, items: filteredItems, isPinned })}
      </Box>
    </Box>
  );
}

function renderNavItems({
  items = [],
  pathname,
  isPinned,
}: {
  items?: NavItemConfig[];
  pathname: string;
  isPinned: boolean;
}): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    const { key, ...item } = curr;

    acc.push(<NavItem key={key} pathname={pathname} isPinned={isPinned} {...item} />);

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
  isPinned: boolean;
}

function NavItem({
  disabled,
  external,
  href,
  icon,
  matcher,
  pathname,
  title,
  isPinned,
}: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? navIcons[icon] : null;

  const navItem = (
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
        justifyContent: isPinned ? 'flex-start' : 'center',
        p: isPinned ? '6px 16px' : '10px 0',
        position: 'relative',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        transition: 'background-color 0.15s ease, color 0.15s ease',
        '&:hover': { bgcolor: active ? undefined : 'var(--NavItem-hover-bg)' },
        ...(disabled && {
          color: 'var(--NavItem-disabled-color)',
          cursor: 'not-allowed',
        }),
        ...(active && {
          bgcolor: 'var(--NavItem-active-background)',
          color: 'var(--NavItem-active-color)',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: '25%',
            bottom: '25%',
            width: 3,
            borderRadius: 2,
            bgcolor: 'var(--NavItem-active-color)',
          },
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
      {isPinned && (
        <Box sx={{ flex: '1 1 auto', overflow: 'hidden' }}>
          <Typography
            component="span"
            sx={{
              color: 'inherit',
              fontSize: '0.875rem',
              fontWeight: 500,
              lineHeight: '28px',
              opacity: isPinned ? 1 : 0,
              transition: 'opacity 0.2s ease',
            }}
          >
            {title}
          </Typography>
        </Box>
      )}
    </Box>
  );

  if (!isPinned) {
    return (
      <li>
        <Tooltip title={title} placement="right" arrow>
          {navItem}
        </Tooltip>
      </li>
    );
  }

  return <li>{navItem}</li>;
}
