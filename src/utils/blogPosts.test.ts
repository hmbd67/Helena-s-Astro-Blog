import { describe, expect, it } from 'vitest';
import { isPublishedPost } from './blogPosts';

describe('isPublishedPost', () => {
	it('includes posts without a draft field for backwards compatibility', () => {
		expect(isPublishedPost({ data: {} })).toBe(true);
	});

	it('includes posts explicitly marked as published', () => {
		expect(isPublishedPost({ data: { draft: false } })).toBe(true);
	});

	it('excludes posts marked as drafts', () => {
		expect(isPublishedPost({ data: { draft: true } })).toBe(false);
	});

	it('filters a collection to published posts', () => {
		const posts = [
			{ id: 'published', data: { draft: false } },
			{ id: 'legacy', data: {} },
			{ id: 'draft', data: { draft: true } },
		];

		expect(posts.filter(isPublishedPost).map(({ id }) => id)).toEqual(['published', 'legacy']);
	});
});
