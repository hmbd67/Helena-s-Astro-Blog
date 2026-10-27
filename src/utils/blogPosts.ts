export function isPublishedPost(post: { data: { draft?: boolean } }): boolean {
	return !post.data.draft;
}
