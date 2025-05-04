export interface HeroProps {
  pretitle?: string;
  title?: string;
  content?: any[];
  ctas?: Sanity.CTA[];
  images?: any[];
  textAlign?: 'left' | 'center' | 'right';
  theme?: 'light' | 'dark' | 'classic';
  asymmetricLayout?: boolean;
  hasBackground?: boolean;
}
