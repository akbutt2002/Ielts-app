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
      <div className="bg-black dark:bg-white flex h-8 w-8 items-center justify-center shrink-0 rounded-sm shadow-sm">
        <span className="text-xl font-black text-white dark:text-black italic leading-none">I</span>
      </div>
      
      {!isCollapsed && (
        <span className="text-xl font-black tracking-tighter uppercase text-black dark:text-white transition-all duration-200">
          IELTS
        </span>
      )}
    </Link>
  );
}
