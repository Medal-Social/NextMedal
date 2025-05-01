import { Search as SearchIcon } from 'lucide-react';
import * as React from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  onSearch?: (value: string) => void;
  iconClassName?: string;
}

const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  ({ className, containerClassName, onSearch, iconClassName, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) onChange(e);
      if (onSearch) onSearch(e.target.value);
    };

    return (
      <div className={cn('relative', containerClassName)}>
        <SearchIcon
          className={cn(
            'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground',
            iconClassName
          )}
        />
        <Input
          type="search"
          className={cn('pl-10', className)}
          onChange={handleChange}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Search.displayName = 'Search';

export { Search };
