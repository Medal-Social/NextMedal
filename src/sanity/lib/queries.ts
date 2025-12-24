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

export const IMAGE_QUERY = groq`
	...,
	asset->{
		...,
		altText,
		metadata
	}
`;

export const NAVIGATION_QUERY = groq`
	title,
	items[]{
		${LINK_QUERY},
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
		people[]->{
			...,
			image { ${IMAGE_QUERY} }
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
			...,
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
		items[]{
			...
		}
	},
	_type == 'contact' => {
		...,
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
