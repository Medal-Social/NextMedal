/**
 * The video id of a link to one YouTube video, else undefined. Accepts
 * watch?v=, youtu.be/, /embed/, /shorts/ and /v/ links on youtube.com,
 * www.youtube.com and m.youtube.com. Channels, playlists and other sites fail.
 */
const YOUTUBE_VIDEO =
  /^(?:https?:\/\/)?(?:(?:www|m)\.)?(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([\w-]{11})(?![\w-])/;

export function getYouTubeId(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return url.trim().match(YOUTUBE_VIDEO)?.[1];
}
