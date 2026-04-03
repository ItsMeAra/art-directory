import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

const listings = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/listings' }),
  schema: z.object({
    name:        z.string(),
    category:    z.enum(['gallery', 'store', 'blog', 'online-marketplace', 'artist-shop', 'auction-house', 'pop-up']),
    tags:        z.array(z.string()).default([]),
    url:         z.string().url(),
    description: z.string(),
    location:    z.string().optional(),
    featured:    z.boolean().default(false),
  }),
});

export const collections = { listings };
