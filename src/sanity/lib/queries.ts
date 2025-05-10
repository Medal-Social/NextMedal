import { groq } from 'next-sanity';

export const SLUG_QUERY = groq`
	array::join([...parent[]->metadata.slug.current, metadata.slug.current], '/')
`;

export const LINK_QUERY = groq`
	...,
	internal->{
		_type,
		title,
		parent[]->{ metadata { slug } },
		metadata
	}
`;

export const NAVIGATION_QUERY = groq`
	title,
	items[]{
		${LINK_QUERY},
		link{ ${LINK_QUERY} },
		links[]{ ${LINK_QUERY} },
		categories[]{
		...,
			links[]{ ${LINK_QUERY} }
		}
	}
`;

export const CTA_QUERY = groq`
	...,
	link{ ${LINK_QUERY} },
		internalLink-> {
		...
	}
`;

export const MODULES_QUERY = groq`
	...,
	ctas[]{${CTA_QUERY}},
	_type == 'blog-list' => { filteredCategory-> },
	_type == 'breadcrumbs' => { crumbs[]{ ${LINK_QUERY} } },
	_type == 'callout' => {
		"copy": content,
	},
	_type == 'hero.saas' => {
		content[]
	},
	_type == 'hero.split' => {
		content[]
	},
	_type== 'galleryHero' => {
		...,
		content[],
		assets[]{..., "image": image.asset->, alt, loading}
	},
	_type == 'logo-list' => { logos[]-> },
	_type == 'person-list' => { 
		...,
		people[]->{...,  "image": image.asset->, altText, loading},
	},
	_type == 'pricing-list' => {
		tiers[]->{
			...,
			ctas[]{${CTA_QUERY}}
		}
	},
	_type == 'richtext-module' => {
		'headings': select(
			tableOfContents => content[style in ['h2', 'h3', 'h4', 'h5', 'h6']]{
				style,
				'text': pt::text(@)
			}
		),
	},
	_type == 'tabbedContent' => {
		tabs[]{
			...,
			ctas[]{ ${CTA_QUERY} },
			content[]{
				...,
				_type == 'featuredHero' => {
					...,
					ctas[]{ ${CTA_QUERY} },
					content[],
					image{..., "image": image.asset->, altText, loading}

				},
			}
		}
	},
	_type == 'featuredHero' => {
		ctas[]{ ${CTA_QUERY} },
		content[],
		image{..., "image": image.asset->, altText, loading}
	},
	_type == 'feature-grid' => {
		...,
		items[]{
			...,
			link{ ${LINK_QUERY} }
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
		thumbnail,
		title
	},
`;

export const GLOBAL_MODULE_QUERY = groq`
	string::startsWith($slug, path)
	&& select(
		defined(excludePaths) => count(excludePaths[string::startsWith($slug, @)]) == 0,
		true
	)
`;
