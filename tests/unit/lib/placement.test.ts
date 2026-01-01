import { describe, expect, it } from 'vitest';
import { groupPlacements, type Placement } from '@/lib/sanity/placement';

// Helper to create a mock module
const createModule = (id: string) => ({
  _type: 'hero' as const,
  _key: id,
});

// Helper to create a mock placement
const createPlacement = (
  id: string,
  location: Placement['location'],
  moduleIds: string[] = ['mod1'],
  injectionConfig?: Placement['injectionConfig']
): Placement => ({
  _id: id,
  scope: 'global',
  location,
  modules: moduleIds.map(createModule),
  ...(injectionConfig && { injectionConfig }),
});

describe('groupPlacements', () => {
  describe('basic grouping', () => {
    it('returns empty groups when placements is null/undefined', () => {
      const result = groupPlacements(null as unknown as Placement[]);

      expect(result).toEqual({
        top: [],
        bottom: [],
        sidebar: [],
        injection: [],
      });
    });

    it('returns empty groups when placements is empty array', () => {
      const result = groupPlacements([]);

      expect(result).toEqual({
        top: [],
        bottom: [],
        sidebar: [],
        injection: [],
      });
    });

    it('groups top placements correctly', () => {
      const placements: Placement[] = [createPlacement('p1', 'top', ['banner1', 'banner2'])];

      const result = groupPlacements(placements);

      expect(result.top).toHaveLength(2);
      expect(result.top[0]._key).toBe('banner1');
      expect(result.top[1]._key).toBe('banner2');
    });

    it('groups bottom placements correctly', () => {
      const placements: Placement[] = [createPlacement('p1', 'bottom', ['cta1'])];

      const result = groupPlacements(placements);

      expect(result.bottom).toHaveLength(1);
      expect(result.bottom[0]._key).toBe('cta1');
    });

    it('groups sidebar placements correctly', () => {
      const placements: Placement[] = [createPlacement('p1', 'sidebar', ['widget1', 'widget2'])];

      const result = groupPlacements(placements);

      expect(result.sidebar).toHaveLength(2);
      expect(result.sidebar[0]._key).toBe('widget1');
      expect(result.sidebar[1]._key).toBe('widget2');
    });

    it('groups injection placements correctly', () => {
      const placements: Placement[] = [
        createPlacement('p1', 'injection', ['ad1'], { afterParagraph: 3 }),
      ];

      const result = groupPlacements(placements);

      expect(result.injection).toHaveLength(1);
      expect(result.injection[0]._id).toBe('p1');
      expect(result.injection[0].injectionConfig?.afterParagraph).toBe(3);
    });
  });

  describe('multiple placements', () => {
    it('groups multiple placements of same type', () => {
      const placements: Placement[] = [
        createPlacement('p1', 'top', ['banner1']),
        createPlacement('p2', 'top', ['banner2']),
      ];

      const result = groupPlacements(placements);

      expect(result.top).toHaveLength(2);
      expect(result.top[0]._key).toBe('banner1');
      expect(result.top[1]._key).toBe('banner2');
    });

    it('groups placements of different types', () => {
      const placements: Placement[] = [
        createPlacement('p1', 'top', ['banner']),
        createPlacement('p2', 'bottom', ['cta']),
        createPlacement('p3', 'sidebar', ['widget']),
        createPlacement('p4', 'injection', ['ad'], { afterParagraph: 2 }),
      ];

      const result = groupPlacements(placements);

      expect(result.top).toHaveLength(1);
      expect(result.bottom).toHaveLength(1);
      expect(result.sidebar).toHaveLength(1);
      expect(result.injection).toHaveLength(1);
    });

    it('maintains order within groups', () => {
      const placements: Placement[] = [
        createPlacement('p1', 'top', ['first']),
        createPlacement('p2', 'bottom', ['bottom-item']),
        createPlacement('p3', 'top', ['second']),
        createPlacement('p4', 'top', ['third']),
      ];

      const result = groupPlacements(placements);

      expect(result.top.map((m) => m._key)).toEqual(['first', 'second', 'third']);
    });
  });

  describe('case insensitivity', () => {
    it('handles uppercase location', () => {
      const placements = [
        {
          _id: 'p1',
          scope: 'global',
          location: 'TOP' as unknown as Placement['location'],
          modules: [createModule('mod1')],
        },
      ];

      const result = groupPlacements(placements);

      expect(result.top).toHaveLength(1);
    });

    it('handles mixed case location', () => {
      const placements = [
        {
          _id: 'p1',
          scope: 'global',
          location: 'Bottom' as unknown as Placement['location'],
          modules: [createModule('mod1')],
        },
      ];

      const result = groupPlacements(placements);

      expect(result.bottom).toHaveLength(1);
    });
  });

  describe('sidebar variations', () => {
    it('handles "sidebar" location', () => {
      const placements = [createPlacement('p1', 'sidebar', ['widget'])];

      const result = groupPlacements(placements);

      expect(result.sidebar).toHaveLength(1);
    });

    it('handles locations containing "sidebar"', () => {
      const placements = [
        {
          _id: 'p1',
          scope: 'global',
          location: 'left-sidebar' as unknown as Placement['location'],
          modules: [createModule('widget1')],
        },
        {
          _id: 'p2',
          scope: 'global',
          location: 'sidebar-right' as unknown as Placement['location'],
          modules: [createModule('widget2')],
        },
      ];

      const result = groupPlacements(placements);

      expect(result.sidebar).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    it('skips placements without modules', () => {
      const placements = [
        {
          _id: 'p1',
          scope: 'global',
          location: 'top' as const,
          modules: undefined,
        },
      ];

      const result = groupPlacements(placements);

      expect(result.top).toHaveLength(0);
    });

    it('skips placements without location', () => {
      const placements = [
        {
          _id: 'p1',
          scope: 'global',
          location: undefined as unknown as Placement['location'],
          modules: [createModule('mod1')],
        },
      ];

      const result = groupPlacements(placements);

      expect(result.top).toHaveLength(0);
      expect(result.bottom).toHaveLength(0);
      expect(result.sidebar).toHaveLength(0);
      expect(result.injection).toHaveLength(0);
    });

    it('skips placements with empty modules array', () => {
      const placements = [createPlacement('p1', 'top', [])];

      const result = groupPlacements(placements);

      // Empty modules array passes the check, but no modules are added
      expect(result.top).toHaveLength(0);
    });

    it('handles unknown location by not grouping', () => {
      const placements = [
        {
          _id: 'p1',
          scope: 'global',
          location: 'unknown' as unknown as Placement['location'],
          modules: [createModule('mod1')],
        },
      ];

      const result = groupPlacements(placements);

      expect(result.top).toHaveLength(0);
      expect(result.bottom).toHaveLength(0);
      expect(result.sidebar).toHaveLength(0);
      expect(result.injection).toHaveLength(0);
    });
  });

  describe('injection placements', () => {
    it('preserves full placement object for injections', () => {
      const placement: Placement = {
        _id: 'injection-1',
        scope: 'articles',
        location: 'injection',
        injectionConfig: { afterParagraph: 5 },
        modules: [createModule('ad1'), createModule('ad2')],
      };

      const result = groupPlacements([placement]);

      expect(result.injection[0]).toEqual(placement);
    });

    it('handles multiple injection placements', () => {
      const placements: Placement[] = [
        createPlacement('inj1', 'injection', ['ad1'], { afterParagraph: 2 }),
        createPlacement('inj2', 'injection', ['ad2'], { afterParagraph: 5 }),
        createPlacement('inj3', 'injection', ['ad3'], { afterParagraph: 10 }),
      ];

      const result = groupPlacements(placements);

      expect(result.injection).toHaveLength(3);
      expect(result.injection[0].injectionConfig?.afterParagraph).toBe(2);
      expect(result.injection[1].injectionConfig?.afterParagraph).toBe(5);
      expect(result.injection[2].injectionConfig?.afterParagraph).toBe(10);
    });
  });

  describe('type safety', () => {
    it('returns correct Placements type structure', () => {
      const result = groupPlacements([]);

      // Type checks
      const topModules: typeof result.top = result.top;
      const bottomModules: typeof result.bottom = result.bottom;
      const sidebarModules: typeof result.sidebar = result.sidebar;
      const injectionPlacements: typeof result.injection = result.injection;

      expect(Array.isArray(topModules)).toBe(true);
      expect(Array.isArray(bottomModules)).toBe(true);
      expect(Array.isArray(sidebarModules)).toBe(true);
      expect(Array.isArray(injectionPlacements)).toBe(true);
    });
  });
});
