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

// Optimized image query - only fetch fields needed for rendering
export const IMAGE_QUERY = groq`
	_key,
	_type,
	alt,
	caption,
	crop,
	hotspot,
	asset->{
		_id,
		url,
		altText,
		metadata {
			dimensions,
			lqip
		}
	}
`;

// Optimized reference projections for blog listings
export const AUTHOR_PREVIEW_QUERY = groq`{
	_id,
	_type,
	name,
	"slug": { "current": metadata.slug.current },
	image { asset->{ url, metadata { dimensions } } }
}`;

export const CATEGORY_PREVIEW_QUERY = groq`{
	_id,
	title,
	"slug": { "current": slug.current }
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

export const NAVIGATION_QUERY = groq`
	title,
	items[]{
		_key,
		title,
		${LINK_QUERY},
		links[]{ ${LINK_QUERY} },
		categories[]{
			...,
			links[]{ ${LINK_QUERY} }
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

// Blog categories that have at least one post
export const BLOG_CATEGORIES_WITH_POSTS_QUERY = groq`
	*[
		_type == 'blog.category' &&
		count(*[_type == 'blog.post' && references(^._id)]) > 0
	]|order(title)
`;

// All blog post slugs for static generation
export const BLOG_POST_SLUGS_QUERY = groq`
	*[_type == 'blog.post' && defined(metadata.slug.current)].metadata.slug.current
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
		(_type == 'page' || _type == 'blog.post') &&
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

// Search index query for posts, pages, and authors
export const SEARCH_INDEX_QUERY = groq`{
	"posts": *[_type == "blog.post" && defined(metadata.slug.current) && seo.noIndex != true] {
		_id,
		_type,
		"title": metadata.title,
		"slug": metadata.slug.current,
		"description": seo.description
	},
	"pages": *[_type == "page" && defined(metadata.slug.current) && metadata.slug.current != "index" && seo.noIndex != true] {
		_id,
		_type,
		"title": metadata.title,
		"slug": metadata.slug.current
	},
	"authors": *[_type == "person"] {
		_id,
		_type,
		"title": name,
		"slug": null
	}
}`;

// Sitemap query for pages and blog posts
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
		'blog': *[_type == 'blog.post' && seo.noIndex != true]|order(name){
			'url': ${baseUrlParam} + 'blog/' + metadata.slug.current,
			'lastModified': _updatedAt,
			'priority': 0.4
		},
	}`;
}

// Sitemap query with translations for hreflang support
export const SITEMAP_WITH_TRANSLATIONS_QUERY = groq`{
	'pages': *[
		_type == 'page' &&
		!(metadata.slug.current in ['404']) &&
		seo.noIndex != true
	]|order(metadata.slug.current){
		'slug': metadata.slug.current,
		'lastModified': _updatedAt,
		'priority': select(
			metadata.slug.current == 'index' => 1,
			0.5
		),
		language,
		'translations': *[_type == 'translation.metadata' && references(^._id)].translations[].value->{
			'slug': metadata.slug.current,
			language
		}
	},
	'blog': *[_type == 'blog.post' && seo.noIndex != true]|order(_updatedAt desc){
		'slug': metadata.slug.current,
		'lastModified': _updatedAt,
		'priority': 0.4,
		language,
		'translations': *[_type == 'translation.metadata' && references(^._id)].translations[].value->{
			'slug': metadata.slug.current,
			language
		}
	}
}`;

// Site settings query
export const SITE_QUERY = groq`
	*[_type == 'site' && _id == 'site'][0]{
		...,
		logo->{
			_id,
			title,
			image {
				default { ${IMAGE_QUERY} },
				dark { ${IMAGE_QUERY} }
			}
		},
		ctas[]{ ${CTA_QUERY} },
		headerMenu->{ ${NAVIGATION_QUERY} },
		enableSearch,
		footerMenu->{ ${NAVIGATION_QUERY} },
		footerLinks[]{ ${LINK_QUERY} },
		systemStatus,
		socialLinks,
		cookieConsent {
			enabled,
			content,
			privacyPolicy->{ "slug": metadata.slug.current }
		},
		'ogimage': ogimage.asset->url,
		'brandPage': *[_type == "page" && metadata.slug.current == "brand"][0]._id
	}
`;
