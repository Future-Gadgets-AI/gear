import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
const posts = defineCollection({
  loader: glob({ pattern: '*/article.md', base: '../content/posts' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    date: z.coerce.date(),
    status: z.enum(['draft', 'approved', 'published']),
    tags: z.array(z.string()).default([]),
    audience: z.string(),
    canonical_url: z.string().url(),
    translation_of: z.string().optional(),
    tl_dr: z.array(z.string()),
  }),
});
export const collections = { posts };
