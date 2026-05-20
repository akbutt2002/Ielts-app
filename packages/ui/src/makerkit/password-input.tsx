'use client';

import { useState } from 'react';

import { Eye, EyeOff } from 'lucide-react';

import { Button } from '../shadcn/button';
import { Input, type InputProps } from '../shadcn/input';
import { cn } from '../lib/utils';

export function PasswordInput({
  className,
  ...props
}: InputProps & {
  className?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={'relative'}>
      <Input
        {...props}
        type={showPassword ? 'text' : 'password'}
        className={cn('pr-10', className)}
      />

      <Button
        type={'button'}
        variant={'ghost'}
        size={'icon'}
        className={
          'absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground'
        }
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        aria-pressed={showPassword}
        onClick={() => setShowPassword((value) => !value)}
      >
        {showPassword ? (
          <EyeOff className={'h-4 w-4'} />
        ) : (
          <Eye className={'h-4 w-4'} />
        )}
      </Button>
    </div>
  );
}
