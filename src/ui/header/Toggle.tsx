import { Menu, X } from 'lucide-react';

export default function Toggle() {
  return (
    <label className="[grid-area:toggle] lg:hidden">
      <input id="header-toggle" type="checkbox" hidden />

      <Menu className="h-6 w-6 header-open:hidden" />
      <X className="h-6 w-6 header-closed:hidden" />
    </label>
  );
}
