import { motion } from 'framer-motion';

interface ToggleProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Path = (props: any) => (
  <motion.path
    fill="transparent"
    strokeWidth="3"
    stroke="currentColor"
    strokeLinecap="round"
    {...props}
  />
);

export default function Toggle({ isOpen, setIsOpen }: ToggleProps) {
  return (
    <button
      type="button"
      className="lg:hidden p-2.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors z-[101]"
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <svg width="23" height="23" viewBox="0 0 23 23" aria-hidden="true">
        <Path
          variants={{
            closed: { d: 'M 2 2.5 L 20 2.5' },
            open: { d: 'M 3 16.5 L 17 2.5' },
          }}
          animate={isOpen ? 'open' : 'closed'}
        />
        <Path
          d="M 2 9.423 L 20 9.423"
          variants={{
            closed: { opacity: 1 },
            open: { opacity: 0 },
          }}
          transition={{ duration: 0.1 }}
          animate={isOpen ? 'open' : 'closed'}
        />
        <Path
          variants={{
            closed: { d: 'M 2 16.346 L 20 16.346' },
            open: { d: 'M 3 2.5 L 17 16.346' },
          }}
          animate={isOpen ? 'open' : 'closed'}
        />
      </svg>
    </button>
  );
}
