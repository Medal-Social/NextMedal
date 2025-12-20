'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface OpenInV0ButtonProps {
  name: string;
  className?: string;
}

export function OpenInV0Button({ name, className }: OpenInV0ButtonProps) {
  const handleClick = () => {
    const origin = window.location.origin;
    const registryUrl = `${origin}/registry`;
    const url = `https://v0.dev/chat/api/open?url=${registryUrl}/${name}.json`;
    
    window.open(url, '_blank');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={handleClick}
    >
      Open in v0
      <ExternalLink className="ml-2 size-3" />
    </Button>
  );
}

