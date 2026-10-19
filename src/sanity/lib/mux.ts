/**
 * Mux video is opt-in; the template ships without it.
 *
 * To use Mux, set MUX_ENABLED to true. sanity.config.ts then registers the Mux
 * plugin (the `mux.video` type and the Videos tool) and the video fields offer
 * "Mux" next to YouTube. Keep `sanity-plugin-mux-input` in package.json and add
 * the Mux access token in the Studio's Videos tool.
 */
export const MUX_ENABLED: boolean = false;

/** The items only while Mux is on: `mux.video` exists only when the plugin is registered. */
export function muxOnly<T>(items: readonly T[]): T[] {
  return MUX_ENABLED ? [...items] : [];
}
