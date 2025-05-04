import CTA from '@/ui/CTA';
import { CgChevronRight } from 'react-icons/cg';
import InteractiveDetails from './InteractiveDetails';

export default function LinkList({ link, links }: Sanity.LinkList) {
  return (
    <InteractiveDetails className="group relative" name="header" delay={10} closeAfterNavigate>
      <summary className="flex h-full items-center gap-1 text-center md:px-3 md:leading-tight">
        {link?.label}
        <CgChevronRight className="shrink-0 transition-transform group-open:rotate-90 md:rotate-90" />
      </summary>

      <ul className="anim-fade-to-b md:bg-background/95 border-foreground/10 top-full left-0 px-3 py-2 max-md:border-l md:absolute md:min-w-max md:rounded md:border md:shadow-md">
        {links?.map((link, key) => (
          <li key={key}>
            <CTA className="hover:link inline-block py-px" link={link} style="link" />
          </li>
        ))}
      </ul>
    </InteractiveDetails>
  );
}
