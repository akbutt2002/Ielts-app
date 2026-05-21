'use client';

import { useMemo } from 'react';

import Link from 'next/link';

import type { JwtPayload } from '@supabase/supabase-js';

import { ChevronsUpDown, Home, LogOut } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { If } from '@kit/ui/if';
import { SubMenuModeToggle } from '@kit/ui/mode-toggle';
import { ProfileAvatar } from '@kit/ui/profile-avatar';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import { usePersonalAccountData } from '../hooks/use-personal-account-data';

export function PersonalAccountDropdown({
  className,
  user,
  signOutRequested,
  showProfileName = true,
  paths,
  features,
  account,
}: {
  user: JwtPayload;

  account?: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
  };

  signOutRequested: () => unknown;

  paths: {
    home: string;
  };

  features: {
    enableThemeToggle: boolean;
  };

  showProfileName?: boolean;

  className?: string;
}) {
  const personalAccountData = usePersonalAccountData(user.id, account);

  const signedInAsLabel = useMemo(() => {
    const email = user?.email ?? undefined;
    const phone = user?.phone ?? undefined;

    return email ?? phone;
  }, [user]);

  const displayName =
    personalAccountData?.data?.name ?? account?.name ?? user?.email ?? '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open your profile menu"
        data-test={'account-dropdown-trigger'}
        className={cn(
          'animate-in fade-in focus:outline-primary flex cursor-pointer items-center duration-500 group-data-[minimized=true]:px-0',
          className ?? '',
          {
            ['active:bg-secondary/50 items-center gap-x-4 rounded-md' +
            ' hover:bg-secondary p-2 transition-colors']: showProfileName,
          },
        )}
      >
        <ProfileAvatar
          className={'rounded-md'}
          fallbackClassName={'rounded-md border'}
          displayName={displayName ?? user?.email ?? ''}
          pictureUrl={personalAccountData?.data?.picture_url}
        />

        <If condition={showProfileName}>
          <div
            className={
              'fade-in animate-in flex w-full flex-col truncate text-left group-data-[minimized=true]:hidden'
            }
          >
            <span
              data-test={'account-dropdown-display-name'}
              className={'truncate text-sm'}
            >
              {displayName}
            </span>

            <span
              data-test={'account-dropdown-email'}
              className={'text-muted-foreground truncate text-xs'}
            >
              {signedInAsLabel}
            </span>
          </div>

          <ChevronsUpDown
            className={
              'text-muted-foreground mr-1 h-8 group-data-[minimized=true]:hidden'
            }
          />
        </If>
      </DropdownMenuTrigger>

      <DropdownMenuContent className={'w-52 xl:!min-w-[13rem]'}>
        <DropdownMenuItem className={'!h-9 rounded-none px-2'}>
          <div
            className={'flex flex-col justify-start truncate text-left text-[11px]'}
          >
            <div className={'text-muted-foreground'}>
              <Trans i18nKey={'common:signedInAs'} />
            </div>

            <div>
              <span className={'block truncate'}>{signedInAsLabel}</span>
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            className={'s-full flex cursor-pointer items-center space-x-1.5 px-2 py-1.5 text-sm'}
            href={paths.home}
          >
            <Home className={'h-4'} />

            <span>
              <Trans i18nKey={'common:routes.home'} />
            </span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <If condition={features.enableThemeToggle}>
          <SubMenuModeToggle />
        </If>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          data-test={'account-dropdown-sign-out'}
          role={'button'}
          className={'cursor-pointer px-2 py-1.5 text-sm'}
          onClick={signOutRequested}
        >
          <span className={'flex w-full items-center space-x-1.5'}>
            <LogOut className={'h-4'} />

            <span>
              <Trans i18nKey={'auth:signOut'} />
            </span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
