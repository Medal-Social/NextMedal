## 1. Registry Generation
- [x] 1.1 Create `scripts/build-registry.ts` to scan `src/components/ui` and generate registry metadata.
- [x] 1.2 Implement dependency resolution to identify shared utils and hooks used by components.
- [x] 1.3 Configure script to output `index.json` and component-specific JSONs to `public/registry`.
- [x] 1.4 Add `build:registry` script to `package.json`.

## 2. Registry API
- [x] 2.1 Verify `public/registry` is accessible via the development server and production build.
- [x] 2.2 Ensure CORS headers allow access from `v0.dev` (if dynamic) or verify static file access works.

## 3. UI Integration
- [x] 3.1 Create `OpenInV0Button` component.
- [x] 3.2 Integrate `OpenInV0Button` into `ComponentPreview.tsx` header.
- [x] 3.3 Construct the correct deep link: `https://v0.dev/chat/api/open?url={registry_url}/{component}.json`.

## 4. Documentation & Validation
- [x] 4.1 Test "Open in v0" flow with at least 5 complex components.
- [x] 4.2 Document how to add new components to the registry (e.g., naming conventions).
