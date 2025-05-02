export default function (posts: Sanity.BlogPost[], showFeaturedPostsFirst = true) {
  if (showFeaturedPostsFirst)
    return posts.sort((a, b) => (b.featured ? 1 : -1) - (a.featured ? 1 : -1));

  return posts;
}
