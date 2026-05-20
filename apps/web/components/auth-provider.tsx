'use client';

import { useEffect } from 'react';

import { useAuthChangeListener } from '@kit/supabase/hooks/use-auth-change-listener';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import pathsConfig from '~/config/paths.config';

export function AuthProvider(props: React.PropsWithChildren) {
  const supabase = useSupabase();

  useAuthChangeListener({
    appHomePath: pathsConfig.app.home,
  });

  useEffect(() => {
    let active = true;

    const clearInvalidSession = async () => {
      const { error } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (isInvalidRefreshTokenError(error?.message ?? '')) {
        await supabase.auth.signOut({ scope: 'local' });
      }
    };

    void clearInvalidSession();

    return () => {
      active = false;
    };
  }, [supabase]);

  return props.children;
}

function isInvalidRefreshTokenError(message: string) {
  return (
    message.includes('Invalid Refresh Token') ||
    message.includes('Refresh Token Not Found')
  );
}
