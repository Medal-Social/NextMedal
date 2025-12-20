import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPONENT_DIR = path.join(__dirname, '../src/components/ui');
const MODULES_DIR = path.join(__dirname, '../src/ui/modules');
const REGISTRY_DIR = path.join(__dirname, '../public/registry');

// Ensure registry directory exists
if (!fs.existsSync(REGISTRY_DIR)) {
  fs.mkdirSync(REGISTRY_DIR, { recursive: true });
}

interface RegistryItem {
  name: string;
  type: string;
  dependencies: string[];
  registryDependencies: string[];
  files: {
    path: string;
    content: string;
    type: string; // "registry:ui" | "registry:component"
  }[];
}

const MODULES_MAPPING: Record<string, string> = {
  'accordion-list': 'AccordionList.tsx',
  breadcrumbs: 'Breadcrumbs.tsx',
  callout: 'Callout.tsx',
  features: 'Features.tsx',
  hero: 'hero/Hero.tsx',
  'logo-cloud': 'LogoCloud.tsx',
  'pricing-list': 'PricingList.tsx',
  'pricing-comparison': 'PricingComparison.tsx',
  'product-comparison': 'ProductComparison.tsx',
  richtext: 'RichtextModule/index.tsx',
  team: 'Team.tsx',
  videoHero: 'VideoHero.tsx',
  'component-gallery': 'ComponentGallery.tsx',
  'blog-frontpage': 'blog/BlogFrontpage/index.tsx',
  'latest-articles': 'blog/LatestArticles/index.tsx',
};

async function buildRegistry() {
  console.log('Building registry...');

  if (!fs.existsSync(COMPONENT_DIR)) {
    console.error(`Component directory not found: ${COMPONENT_DIR}`);
    process.exit(1);
  }

  const registry: RegistryItem[] = [];

  // 1. Process UI Components
  const uiFiles = fs
    .readdirSync(COMPONENT_DIR)
    .filter((file) => file.endsWith('.tsx') || file.endsWith('.ts'));

  for (const file of uiFiles) {
    const content = fs.readFileSync(path.join(COMPONENT_DIR, file), 'utf-8');
    const name = path.basename(file, path.extname(file));

    const { dependencies, registryDependencies } = parseDependencies(content);

    registry.push({
      name,
      type: 'components:ui',
      dependencies: Array.from(dependencies),
      registryDependencies: Array.from(registryDependencies),
      files: [
        {
          path: `ui/${file}`,
          content,
          type: 'registry:ui',
        },
      ],
    });
  }

  // 2. Process Modules
  for (const [moduleName, relativePath] of Object.entries(MODULES_MAPPING)) {
    const fullPath = path.join(MODULES_DIR, relativePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const { dependencies, registryDependencies } = parseDependencies(content);

      registry.push({
        name: moduleName,
        type: 'components:module',
        dependencies: Array.from(dependencies),
        registryDependencies: Array.from(registryDependencies),
        files: [
          {
            path: `modules/${relativePath}`,
            content,
            type: 'registry:component',
          },
        ],
      });
    } else {
      console.warn(`Module file not found: ${fullPath}`);
    }
  }

  // Write index.json
  fs.writeFileSync(path.join(REGISTRY_DIR, 'index.json'), JSON.stringify(registry, null, 2));

  // Write individual component files
  for (const item of registry) {
    fs.writeFileSync(path.join(REGISTRY_DIR, `${item.name}.json`), JSON.stringify(item, null, 2));
  }

  console.log(
    `✅ Registry built with ${registry.length} items (${uiFiles.length} UI, ${Object.keys(MODULES_MAPPING).length} Modules).`
  );
}

function parseDependencies(content: string) {
  // Simple regex to find imports
  const importRegex = /import\s+(?:[\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g;
  const dependencies = new Set<string>();
  const registryDependencies = new Set<string>();

  let match = importRegex.exec(content);
  while (match !== null) {
    const importPath = match[1];
    if (importPath.startsWith('@/components/ui/')) {
      const depName = path.basename(importPath);
      registryDependencies.add(depName);
    } else if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
      dependencies.add(importPath);
    }
    match = importRegex.exec(content);
  }
  return { dependencies, registryDependencies };
}

buildRegistry().catch(console.error);
