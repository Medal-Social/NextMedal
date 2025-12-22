import { cn } from '@/lib/utils';
import SharedPortableText from '@/ui/modules/SharedPortableText';
import Video from '@/ui/Video';
import Code from './Code';
import Image from './Image';

const components = {
  types: {
    image: Image,
    video: ({ value }: { value: any }) => <Video data={value} />,
    code: Code,
  },
};

export default function Content({
  value,
  className,
  children,
}: { value: any } & React.ComponentProps<'div'>) {
  return (
    <div className={cn('relative', className)}>
      <SharedPortableText value={value} variant="prose" components={components} />

      {children}
    </div>
  );
}
