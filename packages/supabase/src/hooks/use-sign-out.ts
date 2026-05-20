import { useMutation } from '@tanstack/react-query';

import { useSupabase } from './use-supabase';

/**
 * @name useSignOut
 * @description Use Supabase to sign out a user in a React component
 */
export function useSignOut() {
  const client = useSupabase();

  return useMutation({
    mutationFn: async () => {
      // Use a local sign-out for the app UI so stale server sessions do not
      // block the user from leaving their account on Vercel/production.
      return client.auth.signOut({ scope: 'local' });
    },
  });
}
