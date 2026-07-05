import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
export async function GET(context) {
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const posts = (await getCollection('posts', ({ data }) => data.status !== 'draft')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
return rss({
title: 'gear',
description: 'Future Gadgets — gear posts',
site: new URL(`${base}/`, context.site),
items: posts.map((post) => ({
title: post.data.title, pubDate: post.data.date, description: post.data.tl_dr[0],
link: `${base}/posts/${post.data.slug}/`, categories: post.data.tags,
})),
});
}
