import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const posts = defineCollection({
  loader: glob({ pattern: '*/article.md', base: '../content/posts' }),
  schema: z.object({ title: z.string(), slug: z.string(), date: z.coerce.date(), tl_dr: z.array(z.string()), tags: z.array(z.string()).default([]) }),
});
export const collections = { posts };
