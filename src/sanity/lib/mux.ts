/**
 * Mux video is opt-in (Vault spec 2026-10-18 D5); the template ships without it.
 *
 * To use Mux in a fork, set MUX_ENABLED to true. sanity.config.ts then registers
 * the Mux plugin (the `mux.video` type and the Videos tool) and the video fields
 * offer "Mux" next to YouTube. Keep `sanity-plugin-mux-input` in package.json.
 *
 * Task 35 cleanup (plan 2026-10-18): the nextmedal.com production dataset still
 * holds the plugin's leftovers, which nothing reads while Mux is off and the
 * lean-schema migration leaves alone: the `mux.videoAsset` document
 * 94503dd7-0cef-4be1-823f-4f54ca73d250 and the plugin's credentials document
 * `secrets.mux` (type `mux.apiKey`). Delete both, and revoke that Mux token,
 * when Task 35 removes the Mux packages.
 */
export const MUX_ENABLED: boolean = false;

/** The items only while Mux is on: `mux.video` exists only when the plugin is registered. */
export function muxOnly<T>(items: readonly T[]): T[] {
  return MUX_ENABLED ? [...items] : [];
}
