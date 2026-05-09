// Image-asset module declarations.
//
// Next.js auto-generates `next-env.d.ts` at the project root on
// `next dev` / `next build`, which transitively pulls in
// `next/image-types/global` and declares these as `StaticImageData`.
// But `next-env.d.ts` is gitignored, so on a fresh CI checkout that
// hasn't run a Next command yet, the types aren't available and
// `tsc --noEmit` fails on imports like
// `import dashboard from '@/sanity/assets/dashboard.png'`.
//
// We re-declare the same module shapes statically here so typecheck
// works regardless of whether next-env.d.ts has been generated.
// `StaticImageData` matches Next.js's `next/image-types/global` so
// downstream code (e.g. `dashboard.src`, `<Image src={dashboard} />`)
// keeps working.
//
// IMPORTANT: this file must NOT have any top-level `import` / `export`
// statements — that would convert it from an ambient declaration file
// into a module, and the `declare module '*.png'` blocks would only
// apply to consumers who explicitly import this file. We use the inline
// `import('next/image').StaticImageData` form to reference the type
// without making this file a module.
declare module '*.png' { const content: import('next/image').StaticImageData; export default content; }
declare module '*.jpg' { const content: import('next/image').StaticImageData; export default content; }
declare module '*.jpeg' { const content: import('next/image').StaticImageData; export default content; }
declare module '*.gif' { const content: import('next/image').StaticImageData; export default content; }
declare module '*.webp' { const content: import('next/image').StaticImageData; export default content; }
declare module '*.avif' { const content: import('next/image').StaticImageData; export default content; }
declare module '*.svg' { const content: import('next/image').StaticImageData; export default content; }
declare module '*.ico' { const content: import('next/image').StaticImageData; export default content; }
