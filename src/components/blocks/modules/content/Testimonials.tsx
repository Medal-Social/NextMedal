import SharedPortableText from '@/components/blocks/modules/SharedPortableText';
import { Img } from '@/components/blocks/objects/core';
import SocialEmbed from '@/components/blocks/objects/core/SocialEmbed';
import { Section } from '@/components/ui/section';
import moduleProps from '@/lib/sanity/module-props';

export default function Testimonials({ intro, reviews, ...props }: Sanity.Testimonials) {
  return (
    <Section className="space-y-8" {...moduleProps(props)}>
      {intro && (
        <header className="section-intro text-center items-center flex flex-col gap-4">
          <SharedPortableText value={intro} />
        </header>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {reviews?.map((review, index) => (
          <article
            key={review._key || `review-${index}`}
            className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm"
            itemScope
            itemType="https://schema.org/Review"
          >
            {/* Review rating */}
            <div
              className="flex items-center gap-2"
              itemScope
              itemProp="reviewRating"
              itemType="https://schema.org/Rating"
            >
              <meta itemProp="ratingValue" content={review.rating?.toString() || '5'} />
              <meta itemProp="bestRating" content="5" />
              <meta itemProp="worstRating" content="1" />
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`h-5 w-5 ${
                      i < (review.rating || 5)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300 fill-gray-300'
                    }`}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <title>Star {i + 1}</title>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{review.rating || 5}/5</span>
            </div>

            {/* Review text */}
            <blockquote
              className="flex-1 text-sm leading-relaxed text-foreground"
              itemProp="reviewBody"
            >
              {review.reviewText}
            </blockquote>

            {/* Social media embed (if present) */}
            {review.embed && (
              <div className="my-4">
                <SocialEmbed platform={review.embed.platform} url={review.embed.url} />
              </div>
            )}

            {/* Review author */}
            <div
              className="flex items-center gap-3 pt-4 border-t border-border"
              itemScope
              itemProp="author"
              itemType="https://schema.org/Person"
            >
              {review.authorImage ? (
                <Img
                  className="h-12 w-12 rounded-full object-cover"
                  image={review.authorImage}
                  width={48}
                  height={48}
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-lg font-semibold text-primary">
                    {review.authorName?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-semibold text-sm" itemProp="name">
                  {review.authorName}
                </span>
                {review.authorTitle && (
                  <span className="text-xs text-muted-foreground" itemProp="jobTitle">
                    {review.authorTitle}
                  </span>
                )}
              </div>
            </div>

            {/* Review date (hidden meta tag) */}
            {review.reviewDate && <meta itemProp="datePublished" content={review.reviewDate} />}
          </article>
        ))}
      </div>
    </Section>
  );
}
