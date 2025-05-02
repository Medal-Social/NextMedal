import moduleProps from '@/lib/moduleProps';
import { cn } from '@/lib/utils';
import Icon from '@/ui/Icon';
import Pretitle from '@/ui/Pretitle';
import { ArrowRight, Check } from 'lucide-react';
import { PortableText } from 'next-sanity';
import CTA from '../CTA';
const colorMap = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-100 dark:border-blue-800',
    gradient: 'from-blue-500/5 dark:from-blue-500/10',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    highlight: 'bg-blue-500 dark:bg-blue-600',
    highlightHover: 'group-hover:bg-blue-600 dark:group-hover:bg-blue-500',
    shadow: 'shadow-blue-500/10',
    buttonHover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
    activeTab: 'bg-blue-100/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-100 dark:border-purple-800',
    gradient: 'from-purple-500/5 dark:from-purple-500/10',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    iconColor: 'text-purple-600 dark:text-purple-400',
    highlight: 'bg-purple-500 dark:bg-purple-600',
    highlightHover: 'group-hover:bg-purple-600 dark:group-hover:bg-purple-500',
    shadow: 'shadow-purple-500/10',
    buttonHover: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
    activeTab: 'bg-purple-100/50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-800',
    gradient: 'from-amber-500/5 dark:from-amber-500/10',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    highlight: 'bg-amber-500 dark:bg-amber-600',
    highlightHover: 'group-hover:bg-amber-600 dark:group-hover:bg-amber-500',
    shadow: 'shadow-amber-500/10',
    buttonHover: 'hover:bg-amber-50 dark:hover:bg-amber-900/20',
    activeTab: 'bg-amber-100/50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  },
};

export default function FeatureGrid({
  pretitle,
  intro,
  items,
  layout = 'vertical',
  ...props
}: Partial<{
  pretitle: string;
  intro: any;
  items: {
    pretitle: string;
    summary: string;
    content: any;
    icon?: Sanity.Icon;
    _key: string;
    link?: Sanity.Link;
  }[];
  layout: 'vertical' | 'horizontal';
  isTabbedModule?: boolean;
}> &
  Sanity.Module) {
  return (
    <section className="section " {...moduleProps(props)}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(pretitle || intro) && (
          <header className="hero text-center mb-16 md:mb-24">
            {pretitle && <Pretitle className="mb-6">{pretitle}</Pretitle>}

            {intro && (
              <div className="hero ">
                <PortableText value={intro} />
              </div>
            )}
          </header>
        )}

        <div
          className={cn(
            'grid gap-8 lg:gap-12',
            layout === 'horizontal' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-3'
          )}
        >
          {items?.map((item, ix) => (
            <div
              key={item._key}
              className={cn(
                'bg-card rounded-2xl p-8 shadow-lg border border-border hover:shadow-xl transition-shadow flex flex-col h-full',
                ix % 3 === 0
                  ? `${colorMap.blue.shadow} ${colorMap.blue.border}`
                  : ix % 3 === 1
                    ? `${colorMap.purple.shadow} ${colorMap.purple.border}`
                    : `${colorMap.amber.shadow} ${colorMap.amber.border}`
              )}
            >
              {(item.icon || item.pretitle) && (
                <div className="flex items-center gap-3 mb-6">
                  {item.icon && (
                    <div
                      className={cn(
                        'w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0',
                        ix % 3 === 0
                          ? `${colorMap.blue.iconBg} ${colorMap.blue.iconColor}`
                          : ix % 3 === 1
                            ? `${colorMap.purple.iconBg} ${colorMap.purple.iconColor}`
                            : `${colorMap.amber.iconBg} ${colorMap.amber.iconColor}`
                      )}
                      aria-hidden="true"
                    >
                      <Icon icon={item.icon} className="w-6 h-6" />
                    </div>
                  )}
                  {item.pretitle && (
                    <p
                      className={cn(
                        'text-sm font-medium',
                        ix % 3 === 0
                          ? colorMap.blue.text
                          : ix % 3 === 1
                            ? colorMap.purple.text
                            : colorMap.amber.text
                      )}
                    >
                      {item.pretitle}
                    </p>
                  )}
                </div>
              )}
              <p className="text-xl font-bold text-foreground mb-3">{item.summary}</p>

              <div className="[&_p]:text-pretty [&_p]:text-muted-foreground [&_a]:underline [&_p]:[&:not(:first-child)]:mt-2 flex-grow">
                <PortableText
                  value={item.content}
                  components={{
                    list: {
                      bullet: ({ children }) => <ul className="space-y-4 mt-3">{children}</ul>,
                    },
                    listItem: {
                      bullet: ({ children }) => (
                        <li className="flex items-start gap-3 ">
                          <Check
                            className={cn(
                              'w-5 h-5 text-primary mt-0.5 flex-shrink-0',
                              ix % 3 === 0
                                ? `${colorMap.blue.iconColor} ${colorMap.blue.iconColor}`
                                : ix % 3 === 1
                                  ? `${colorMap.purple.iconColor} ${colorMap.purple.iconColor}`
                                  : `${colorMap.amber.iconColor} ${colorMap.amber.iconColor}`
                            )}
                            aria-hidden="true"
                          />
                          <div className="text-muted-foreground">{children}</div>
                        </li>
                      ),
                    },
                  }}
                />
              </div>
              {item.link && (
                <CTA
                  link={item.link}
                  className={cn(
                    'mt-6 self-start hover:text-underline-offset-4 p-0',
                    ix % 3 === 0
                      ? colorMap.blue.text
                      : ix % 3 === 1
                        ? colorMap.purple.text
                        : colorMap.amber.text
                  )}
                >
                  {item.link.label}
                  <ArrowRight className="w-4 h-4" />
                </CTA>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
