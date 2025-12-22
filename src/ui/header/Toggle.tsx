import { Menu, X } from 'lucide-react';

interface ToggleProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Toggle({ isOpen, setIsOpen }: ToggleProps) {
  return (
    <button
      type="button"
      className="lg:hidden p-2.5 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </button>
  );
}
