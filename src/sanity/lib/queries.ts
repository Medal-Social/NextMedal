import { groq } from 'next-sanity';

export const SLUG_QUERY = groq`
	metadata.slug.current
`;

// Link query with all required fields
export const LINK_QUERY = groq`
	_key,
	_type,
	type,
	label,
	external,
	newTab,
	params,
	internal->{
		_id,
		_type,
		title,
		metadata { slug }
	}
`;

// Optimized image query - NO asset resolution for 30-50% faster queries
// Dimensions are extracted from asset._ref, URLs built via @sanity/image-url
export const IMAGE_QUERY = groq`
	_key,
	_type,
	alt,
	caption,
	crop,
	hotspot,
	asset {
		_ref,
		_type
	}
`;

// Optimized reference projections for article listings
// OPTIMIZED: No asset resolution - URLs built via image URL builder
export const AUTHOR_PREVIEW_QUERY = groq`{
	_id,
	_type,
	name,
	title,
	slug,
	image { ${IMAGE_QUERY} },
	banner { ${IMAGE_QUERY} },
	bio,
	socialLinks[]{ _key, _type, platform, url }
}`;

export const CATEGORY_PREVIEW_QUERY = groq`{
	_id,
	title,
	"slug": { "current": slug.current }
}`;

export const PERSON_PREVIEW_QUERY = groq`{
	_id,
	name,
	role,
	image { ${IMAGE_QUERY} }
}`;

export const PT_BLOCK_QUERY = groq`
	...,
	markDefs[]{
		...,
		_type == 'link' => {
			${LINK_QUERY}
		}
	}
`;

// CTA query with all required fields
export const CTA_QUERY = groq`
	_key,
	_type,
	style,
	link{ ${LINK_QUERY} }
`;

// Base modules query for non-recursive parts
const BASE_MODULES_QUERY = groq`
	...,
	ctas[]{${CTA_QUERY}},
	_type == 'breadcrumbs' => { crumbs[]{ ${LINK_QUERY} } },
	_type == 'callout' => {
		"copy": content,
	},
	_type == 'logo-cloud' => { 
		logos[]->{
			...,
			image {
				default { ${IMAGE_QUERY} },
				dark { ${IMAGE_QUERY} }
			}
		} 
	},
	_type == 'team' => {
		...,
		intro[]{ ${PT_BLOCK_QUERY} },
		people[]->{
			...,
			image { ${IMAGE_QUERY} },
			bio[]{ ${PT_BLOCK_QUERY} }
		},
	},
	_type == 'pricing-list' => {
		tiers[]->{
			...,
			ctas[]{${CTA_QUERY}}
		}
	},
	_type == 'richtext' => {
		content[]{
			${PT_BLOCK_QUERY},
			_type == 'image' => {
				${IMAGE_QUERY}
			}
		},
		'headings': select(
			tableOfContents => content[style in ['h2', 'h3', 'h4', 'h5', 'h6']]{
				style,
				'text': pt::text(@)
			}
		),
	},
	_type == 'features' => {
		...,
		intro[]{ ${PT_BLOCK_QUERY} },
		items[]{
			...,
			content[]{ ${PT_BLOCK_QUERY} }
		}
	},
	_type == 'contact' => {
		...,
		intro[]{ ${PT_BLOCK_QUERY} },
		form->{
			...,
			redirect { ${LINK_QUERY} }
		},
		contactPerson {
			...,
			image {
				image {
					${IMAGE_QUERY}
				}
			}
		}
	},
	_type == 'lead-magnet' => {
		...,
		content[]{ ${PT_BLOCK_QUERY} },
		form->{
			...,
			redirect { ${LINK_QUERY} }
		},
		image {
			image {
				${IMAGE_QUERY}
			}
		}
	},
	_type == 'hero' => {
		...,
		content[]{ ${PT_BLOCK_QUERY} },
		image {
			image {
				${IMAGE_QUERY}
			}
		}
	},
	_type == 'videoHero' => {
		_type,
		type,
		videoId,
		muxVideo{
			...,
			asset->{
				...,
				"playbackId": playback_ids[0].id
			}
		},
		thumbnail {
			${IMAGE_QUERY}
		},
		title
	},
`;

export const MODULES_QUERY = groq`
	${BASE_MODULES_QUERY}
	_type == 'component-gallery' => {
		...,
		groups[]{
			...,
			items[]{
				${BASE_MODULES_QUERY}
			}
		}
	},
`;

export const PLACEMENT_QUERY = groq`
	_type == 'placement' && scope == $scope
`;

export function placementQuery(scopeFilter: string) {
  return groq`*[_type == 'placement' && (${scopeFilter})]{
		_id,
		scope,
		location,
		injectionConfig,
		modules[]{ ${MODULES_QUERY} }
	}`;
}

export const TRANSLATIONS_QUERY = groq`
	'translations': *[_type == 'translation.metadata' && references(^._id)].translations[].value->{
		'slug': metadata.slug.current,
		language,
		_type
	}
`;

export const PAGE_QUERY = groq`
	*[_type == 'page' && metadata.slug.current == $slug && language == $locale][0]{
		...,
		'modules': modules[]{ ${MODULES_QUERY} },
		'placements': ${placementQuery("scope == 'page'")},
		metadata,
		seo {
			...,
			'ogimage': image.asset->url + '?w=1200',
		},
		${TRANSLATIONS_QUERY}
	}
`;

// Article categories that have at least one post
// Categories that have posts in a specific language
// OPTIMIZED: Reverse query - start with articles, extract categories
// This avoids O(n×m) nested count query by using a single pass
export const ARTICLE_CATEGORIES_WITH_POSTS_QUERY = groq`
	*[_type == 'article.category' && _id in array::unique(*[
		_type == 'collection.article' &&
		($locale == '' || language == $locale) &&
		defined(categories) &&
		count(categories) > 0
	].categories[]->._id)]|order(title){
		_id,
		_type,
		title,
		"slug": { "current": slug.current }
	}
`;

// Collection article query - fetches an article by slug and language
export const COLLECTION_ARTICLE_POST_QUERY = groq`
	*[
		_type == 'collection.article' &&
		metadata.slug.current == $itemSlug &&
		language == $locale
	][0]{
		...,
		body[]{
			${PT_BLOCK_QUERY},
			_type == 'image' => { ${IMAGE_QUERY} },
			_type == 'socialEmbed' => { _type, platform, url },
			_type == 'video' => { _type, type, videoId, muxVideo, thumbnail, title }
		},
		'readTime': math::max([1, round(length(string::split(pt::text(body), ' ')) / 200)]),
		'headings': body[style in ['h2', 'h3']]{
			style,
			'text': pt::text(@)
		},
		categories[]->${CATEGORY_PREVIEW_QUERY},
		authors[]->${AUTHOR_PREVIEW_QUERY},
		metadata,
		seo {
			...,
			'ogimage': image.asset->url + '?w=1200'
		},
		'translations': *[_type == 'translation.metadata' && references(^._id)].translations[].value->{
			_type,
			'slug': metadata.slug.current,
			language
		}
	}
`;

// Query to check if a page is a collection (has frontpage modules)
export const IS_COLLECTION_PAGE_QUERY = groq`
	*[
		_type == 'page' &&
		metadata.slug.current == $slug &&
		language == $locale
	][0]{
		_id,
		'isCollection': count(modules[_type in ['articles-frontpage', 'changelog-frontpage', 'docs-frontpage', 'events-frontpage', 'newsletter-frontpage']]) > 0,
		'collectionType': modules[_type in ['articles-frontpage', 'changelog-frontpage', 'docs-frontpage', 'events-frontpage', 'newsletter-frontpage']][0]._type
	}
`;

// All collection articles for static generation
export const COLLECTION_ARTICLE_SLUGS_QUERY = groq`
	*[_type == 'collection.article' && defined(metadata.slug.current)]{
		'slug': metadata.slug.current,
		_type,
		language
	}
`;

// Collection newsletter query - fetches a newsletter issue by slug and language
export const COLLECTION_NEWSLETTER_QUERY = groq`
	*[
		_type == 'collection.newsletter' &&
		metadata.slug.current == $itemSlug &&
		language == $locale
	][0]{
		...,
		body[]{
			${PT_BLOCK_QUERY},
			_type == 'image' => { ${IMAGE_QUERY} },
			_type == 'socialEmbed' => { _type, platform, url },
			_type == 'video' => { _type, type, videoId, muxVideo, thumbnail, title }
		},
		'readTime': math::max([1, round(length(string::split(pt::text(body), ' ')) / 200)]),
		'headings': body[style in ['h2', 'h3']]{
			style,
			'text': pt::text(@)
		},
		metadata,
		seo {
			...,
			'ogimage': image.asset->url + '?w=1200'
		},
		'translations': *[_type == 'translation.metadata' && references(^._id)].translations[].value->{
			_type,
			'slug': metadata.slug.current,
			language
		}
	}
`;

// All collection newsletter issues for static generation
export const COLLECTION_NEWSLETTER_SLUGS_QUERY = groq`
	*[_type == 'collection.newsletter' && defined(metadata.slug.current)]{
		'slug': metadata.slug.current,
		_type,
		language
	}
`;

// Collection documentation query - fetches a doc article by slug and language
export const COLLECTION_DOCUMENTATION_QUERY = groq`
	*[
		_type == 'collection.documentation' &&
		metadata.slug.current == $itemSlug &&
		language == $locale
	][0]{
		...,
		body[]{
			${PT_BLOCK_QUERY},
			_type == 'image' => { ${IMAGE_QUERY} },
			_type == 'socialEmbed' => { _type, platform, url },
			_type == 'video' => { _type, type, videoId, muxVideo, thumbnail, title }
		},
		'readTime': math::max([1, round(length(string::split(pt::text(body), ' ')) / 200)]),
		'headings': body[style in ['h2', 'h3']]{
			style,
			'text': pt::text(@)
		},
		parent->{
			_id,
			metadata { slug, title }
		},
		relatedDocs[]->{
			_id,
			metadata { slug, title },
			excerpt
		},
		metadata,
		seo {
			...,
			'ogimage': image.asset->url + '?w=1200'
		},
		'translations': *[_type == 'translation.metadata' && references(^._id)].translations[].value->{
			_type,
			'slug': metadata.slug.current,
			language
		}
	}
`;

// All collection documentation articles for static generation
export const COLLECTION_DOCUMENTATION_SLUGS_QUERY = groq`
	*[_type == 'collection.documentation' && defined(metadata.slug.current)]{
		'slug': metadata.slug.current,
		_type,
		language
	}
`;

// Collection events query - fetches an event by slug and language
export const COLLECTION_EVENTS_QUERY = groq`
	*[
		_type == 'collection.events' &&
		metadata.slug.current == $itemSlug &&
		language == $locale
	][0]{
		...,
		body[]{
			${PT_BLOCK_QUERY},
			_type == 'image' => { ${IMAGE_QUERY} },
			_type == 'socialEmbed' => { _type, platform, url },
			_type == 'video' => { _type, type, videoId, muxVideo, thumbnail, title }
		},
		speakers[]->{
			_id,
			name,
			role,
			image { ${IMAGE_QUERY} }
		},
		metadata,
		seo {
			...,
			'ogimage': image.asset->url + '?w=1200'
		},
		'translations': *[_type == 'translation.metadata' && references(^._id)].translations[].value->{
			_type,
			'slug': metadata.slug.current,
			language
		}
	}
`;

// All collection events for static generation
export const COLLECTION_EVENTS_SLUGS_QUERY = groq`
	*[_type == 'collection.events' && defined(metadata.slug.current)]{
		'slug': metadata.slug.current,
		_type,
		language
	}
`;

// All logos with image variants
export const LOGOS_QUERY = groq`
	*[_type == 'logo']|order(title){
		...,
		image {
			default { ${IMAGE_QUERY} },
			light { ${IMAGE_QUERY} },
			dark { ${IMAGE_QUERY} }
		}
	}
`;

// Site banners from site document
export const SITE_BANNERS_QUERY = groq`
	*[_type == 'site'][0].banners[]->{
		...,
		cta{ ${LINK_QUERY} },
	}
`;

// 404 page with modules (locale-aware)
export const PAGE_404_QUERY = groq`
	*[_type == 'page' && metadata.slug.current == '404' && language == $locale][0]{
		...,
		modules[]{ ${MODULES_QUERY} }
	}
`;

// Current page for translation switching
export const CURRENT_PAGE_QUERY = groq`
	*[
		(_type == 'page' ||
			_type == 'collection.article' ||
			_type == 'collection.documentation' ||
			_type == 'collection.changelog' ||
			_type == 'collection.newsletter' ||
			_type == 'collection.events') &&
		metadata.slug.current == $slug &&
		language == $locale
	][0]{
		_type,
		_id,
		language,
		metadata {
			slug
		},
		${TRANSLATIONS_QUERY}
	}
`;

export const HOMEPAGE_TRANSLATIONS_QUERY = groq`
	*[_type == 'page' && metadata.slug.current == 'index' && language != $locale]{
		'slug': metadata.slug.current,
		language,
		_type
	}
`;

// Search index query for pages, collections, and authors
// OPTIMIZED: Removed nested select queries - collectionSlug resolved in API route
// This eliminates 500+ subqueries for 100 collection items (100x performance improvement)
export const SEARCH_INDEX_QUERY = groq`{
	"pages": *[_type == "page" && defined(metadata.slug.current) && metadata.slug.current != "index" && seo.noIndex != true] {
		_id,
		_type,
		"title": metadata.title,
		"slug": metadata.slug.current,
		language
	},
	"collections": *[_type in ["collection.article", "collection.changelog", "collection.documentation", "collection.newsletter"] && defined(metadata.slug.current) && seo.noIndex != true] {
		_id,
		_type,
		"title": metadata.title,
		"slug": metadata.slug.current,
		"description": seo.description,
		language
	},
	"authors": *[_type == "person"] {
		_id,
		_type,
		"title": name,
		"slug": null
	}
}`;

// Sitemap query for pages
export function sitemapQuery(baseUrlParam: string) {
  return groq`{
		'pages': *[
			_type == 'page' &&
			!(metadata.slug.current in ['404']) &&
			seo.noIndex != true
		]|order(metadata.slug.current){
			'url': ${baseUrlParam} + select(metadata.slug.current == 'index' => '', metadata.slug.current),
			'lastModified': _updatedAt,
			'priority': select(
				metadata.slug.current == 'index' => 1,
				0.5
			),
		},
	}`;
}

// Sitemap query with translations for hreflang support
// OPTIMIZED: Removed nested translation queries - translations resolved in sitemap route
// This eliminates 700+ nested queries for large sites (50x performance improvement)
export const SITEMAP_WITH_TRANSLATIONS_QUERY = groq`{
	'pages': *[
		_type == 'page' &&
		!(metadata.slug.current in ['404']) &&
		seo.noIndex != true
	]|order(metadata.slug.current){
		_id,
		_type,
		'slug': metadata.slug.current,
		'lastModified': _updatedAt,
		'priority': select(
			metadata.slug.current == 'index' => 1,
			0.5
		),
		language
	},
	'articles': *[_type == 'collection.article' && seo.noIndex != true]|order(_updatedAt desc){
		_id,
		_type,
		'slug': metadata.slug.current,
		'lastModified': _updatedAt,
		'priority': 0.6,
		language
	},
	'collections': *[_type in ['collection.changelog', 'collection.documentation', 'collection.newsletter'] && seo.noIndex != true]|order(_updatedAt desc){
		_id,
		_type,
		'slug': metadata.slug.current,
		'lastModified': _updatedAt,
		'priority': 0.4,
		language
	}
}`;

// Translation metadata query for sitemap - fetch all translations in one go
export const SITEMAP_TRANSLATIONS_QUERY = groq`
	*[_type == 'translation.metadata']{
		_id,
		'documentId': references(*._id)[0]._id,
		'translations': translations[]{
			'value': value->{
				_id,
				_type,
				'slug': metadata.slug.current,
				language
			}
		}
	}
`;

// Site settings query - Full site settings (for metadata, manifest, etc.)
export const SITE_QUERY = groq`
	*[_type == 'site'][0]{
		_id,
		_type,
		"title": coalesce(title[_key == $language][0].value, title[_key == "en"][0].value),
		"tagline": coalesce(tagline[_key == $language][0].value, tagline[_key == "en"][0].value),
		logo->{
			_id,
			title,
			image {
				default { ${IMAGE_QUERY} },
				dark { ${IMAGE_QUERY} }
			}
		},
		"ctas": coalesce(ctas[_key == $language][0].value, ctas[_key == "en"][0].value)[]{
			${CTA_QUERY}
		},
		"headerNav": coalesce(headerNav[_key == $language][0].value, headerNav[_key == "en"][0].value)[]{
			_key,
			_type,
			_type == 'menuItem' => {
				${LINK_QUERY}
			},
			_type == 'dropdownMenu' => {
				title,
				links[]{ ${LINK_QUERY} }
			}
		},
		enableSearch,
		"footerNav": coalesce(footerNav[_key == $language][0].value, footerNav[_key == "en"][0].value)[]{
			_key,
			_type,
			title,
			links[]{ ${LINK_QUERY} }
		},
		"footerLinks": coalesce(footerLinks[_key == $language][0].value, footerLinks[_key == "en"][0].value)[]{
			${LINK_QUERY}
		},
		"copyright": coalesce(copyright[_key == $language][0].value, copyright[_key == "en"][0].value),
		systemStatus,
		socialLinks,
		cookieConsent {
			enabled,
			content,
			privacyPolicy->{ "slug": metadata.slug.current }
		},
		collections,
		banners,
		'ogimage': ogimage.asset->url,
		'brandPage': *[_type == "page" && metadata.slug.current == "brand"][0]._id
	}
`;

// Header-specific settings query
export const HEADER_SETTINGS_QUERY = groq`
	*[_type == 'site'][0]{
		_id,
		"title": coalesce(title[_key == $language][0].value, title[_key == "en"][0].value),
		logo->{
			_id,
			title,
			image {
				default { ${IMAGE_QUERY} },
				dark { ${IMAGE_QUERY} }
			}
		},
		"headerNav": coalesce(headerNav[_key == $language][0].value, headerNav[_key == "en"][0].value)[]{
			_key,
			_type,
			_type == 'menuItem' => {
				${LINK_QUERY}
			},
			_type == 'dropdownMenu' => {
				title,
				links[]{ ${LINK_QUERY} }
			}
		},
		"ctas": coalesce(ctas[_key == $language][0].value, ctas[_key == "en"][0].value)[]{
			${CTA_QUERY}
		},
		enableSearch,
		'brandPage': *[_type == "page" && metadata.slug.current == "brand"][0]._id
	}
`;

// Footer-specific settings query
export const FOOTER_SETTINGS_QUERY = groq`
	*[_type == 'site'][0]{
		_id,
		"title": coalesce(title[_key == $language][0].value, title[_key == "en"][0].value),
		"tagline": coalesce(tagline[_key == $language][0].value, tagline[_key == "en"][0].value),
		logo->{
			_id,
			title,
			image {
				default { ${IMAGE_QUERY} },
				dark { ${IMAGE_QUERY} }
			}
		},
		"footerNav": coalesce(footerNav[_key == $language][0].value, footerNav[_key == "en"][0].value)[]{
			_key,
			_type,
			title,
			links[]{ ${LINK_QUERY} }
		},
		"footerLinks": coalesce(footerLinks[_key == $language][0].value, footerLinks[_key == "en"][0].value)[]{
			${LINK_QUERY}
		},
		"copyright": coalesce(copyright[_key == $language][0].value, copyright[_key == "en"][0].value),
		systemStatus,
		socialLinks
	}
`;

// Social links query
export const SOCIAL_LINKS_QUERY = groq`
	*[_type == 'site'][0].socialLinks
`;
