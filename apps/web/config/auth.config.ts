import type { Provider } from '@supabase/supabase-js';

import { z } from 'zod';

const providerSchema: z.ZodType<Provider> = getProviders();

const AuthConfigSchema = z.object({
  captchaTokenSiteKey: z
    .string({
      description: 'The reCAPTCHA site key.',
    })
    .optional(),
  displayTermsCheckbox: z
    .boolean({
      description: 'Whether to display the terms checkbox during sign-up.',
    })
    .optional(),
  providers: z.object({
    password: z.boolean({
      description: 'Enable password authentication.',
    }),
    magicLink: z.boolean({
      description: 'Enable magic link authentication.',
    }),
    oAuth: providerSchema.array(),
  }),
});

const authConfig = AuthConfigSchema.parse({
  // NB: This is a public key, so it's safe to expose.
  // Copy the value from the Supabase Dashboard.
  captchaTokenSiteKey: process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY,

  // whether to display the terms checkbox during sign-up
  displayTermsCheckbox:
    process.env.NEXT_PUBLIC_DISPLAY_TERMS_AND_CONDITIONS_CHECKBOX === 'true',

  // NB: List the OAuth providers that are enabled in your Supabase Console.
  providers: {
    password: process.env.NEXT_PUBLIC_AUTH_PASSWORD === 'true',
    magicLink: process.env.NEXT_PUBLIC_AUTH_MAGIC_LINK === 'true',
    oAuth: getOAuthProviders(),
  },
} satisfies z.infer<typeof AuthConfigSchema>);

export default authConfig;

function getProviders() {
  return z.enum([
    'apple',
    'azure',
    'bitbucket',
    'discord',
    'facebook',
    'figma',
    'github',
    'gitlab',
    'google',
    'kakao',
    'keycloak',
    'linkedin',
    'linkedin_oidc',
    'notion',
    'slack',
    'spotify',
    'twitch',
    'twitter',
    'workos',
    'zoom',
    'fly',
  ]);
}

function getOAuthProviders(): Provider[] {
  const configuredProviders =
    process.env.NEXT_PUBLIC_AUTH_OAUTH_PROVIDERS?.split(',') ?? [];

  const providers = configuredProviders
    .map((provider) => provider.trim())
    .filter(Boolean)
    .filter(
      (provider): provider is Provider =>
        providerSchema.safeParse(provider).success,
    );

  return providers;
}
