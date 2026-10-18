/**
 * @file SocialEmbed — re-exports the card suite entry for the historical path.
 * Detailed coverage lives under tests/components/blocks/objects/core/social-embed/
 * and tests/unit/lib/social-embed/.
 */

import { describe, expect, it } from 'vitest';
import { parseSocialEmbedInput } from '@/lib/social-embed';

const ANTHROPIC_X = 'https://x.com/AnthropicAI/status/2110047081414987957';
const GITLAB_X = 'https://x.com/gitlab/status/2110167424234295775';

describe('SocialEmbed smoke (legacy path)', () => {
  it('accepts the Ali-provided X test URLs', () => {
    expect(parseSocialEmbedInput('twitter', ANTHROPIC_X)?.id).toBe('2110047081414987957');
    expect(parseSocialEmbedInput('twitter', GITLAB_X)?.id).toBe('2110167424234295775');
  });
});
