'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@kit/ui/utils';
import { SidebarContext } from '@kit/ui/shadcn-sidebar';

export function AppLogo({
  href,
  label,
  className,
}: {
  href?: string | null;
  className?: string;
  label?: string;
}) {
  const sidebar = React.useContext(SidebarContext);
  const isCollapsed = sidebar ? sidebar.state === 'collapsed' : false;

  return (
    <Link
      aria-label={label ?? 'Home Page'}
      href={href ?? '/'}
      className={cn('flex items-center gap-2 group', className)}
    >
      <img
        src="/images/favicon/getieltsy-mark.svg"
        alt=""
        aria-hidden="true"
        className="h-8 w-8 shrink-0 rounded-xl shadow-sm"
      />
      
      {!isCollapsed && (
        <span className="text-xl font-black tracking-tighter uppercase text-black transition-all duration-200 dark:text-white">
          GetIeltsy
        </span>
      )}
    </Link>
  );
}
