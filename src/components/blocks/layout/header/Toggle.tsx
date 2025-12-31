import { motion, type SVGMotionProps } from 'motion/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/index';

interface ToggleProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  className?: string;
}

type PathProps = SVGMotionProps<SVGPathElement>;

const Path = (props: PathProps) => (
  <motion.path
    fill="transparent"
    strokeWidth="2.5"
    stroke="currentColor"
    strokeLinecap="round"
    {...props}
  />
);

export default function Toggle({ isOpen, setIsOpen, className }: ToggleProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-lg"
      className={cn(
        'rounded-md hover:bg-accent/50 transition-colors z-[101]',
        className || 'lg:hidden'
      )}
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <svg width="20" height="20" viewBox="0 0 23 23" aria-hidden="true">
        <Path
          variants={{
            closed: { d: 'M 2 2.5 L 20 2.5', opacity: 1 },
            open: { d: 'M 3 16.5 L 17 2.5', opacity: 1 },
          }}
          initial="closed"
          animate={isOpen ? 'open' : 'closed'}
        />
        <Path
          d="M 2 9.423 L 20 9.423"
          variants={{
            closed: { opacity: 1 },
            open: { opacity: 0 },
          }}
          initial="closed"
          transition={{ duration: 0.1 }}
          animate={isOpen ? 'open' : 'closed'}
        />
        <Path
          variants={{
            closed: { d: 'M 2 16.346 L 20 16.346', opacity: 1 },
            open: { d: 'M 3 2.5 L 17 16.346', opacity: 1 },
          }}
          initial="closed"
          animate={isOpen ? 'open' : 'closed'}
        />
      </svg>
    </Button>
  );
}
