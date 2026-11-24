import { z } from 'zod';
// Validate only configuration owned by this app; do not consume other environment values.
const schema = z
  .object({
    SITE_URL: z.url().optional(),
    CONTACT_EMAIL: z.email().optional(),
    // The public Phonlet Wake repository; the docs link its latest release once it is set.
    REPO_URL: z.url().optional(),
  })
  .strict();
export const site = schema.parse({
  SITE_URL: process.env.SITE_URL || undefined,
  CONTACT_EMAIL: process.env.CONTACT_EMAIL || undefined,
  REPO_URL: process.env.REPO_URL || undefined,
});
