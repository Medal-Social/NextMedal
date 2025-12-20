import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPONENT_DIR = path.join(__dirname, '../src/components/ui');
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
    type: string; // "registry:ui"
  }[];
}

async function buildRegistry() {
  console.log('Building registry...');
  
  if (!fs.existsSync(COMPONENT_DIR)) {
      console.error(`Component directory not found: ${COMPONENT_DIR}`);
      process.exit(1);
  }

  const files = fs.readdirSync(COMPONENT_DIR).filter(file => file.endsWith('.tsx') || file.endsWith('.ts'));
  const registry: RegistryItem[] = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(COMPONENT_DIR, file), 'utf-8');
    const name = path.basename(file, path.extname(file));
    
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
        }
      ]
    });
  }

  // Write index.json
  fs.writeFileSync(path.join(REGISTRY_DIR, 'index.json'), JSON.stringify(registry, null, 2));
  
  // Write individual component files (optional but good for v0)
  for (const item of registry) {
      fs.writeFileSync(path.join(REGISTRY_DIR, `${item.name}.json`), JSON.stringify(item, null, 2));
  }

  console.log(`✅ Registry built with ${registry.length} components.`);
}

buildRegistry().catch(console.error);

