const ACME_HTTP_01_PATH = /^\/\.well-known\/acme-challenge\/[A-Za-z0-9_-]+$/;
const VALID_PERCENT_OCTET = /%[0-9A-Fa-f]{2}/;
const SENSITIVE_PATH_SEGMENT = /^(?:\.env(?:$|~$|[._-].+)|\.git)$/i;
const MAX_DECODE_PASSES = 4;

function hasEncodedTerminator(segment, sensitiveName) {
  if (!segment.toLowerCase().startsWith(sensitiveName)) return false;
  const nextCodePoint = segment.codePointAt(sensitiveName.length);
  return nextCodePoint !== undefined && (nextCodePoint <= 0x20 || nextCodePoint === 0x7f);
}

function notFoundResponse() {
  return new Response('Not found', {
    status: 404,
    headers: {
      'Cache-Control': 'public, max-age=300',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

function canonicalizePath(rawPath) {
  let canonicalPath = rawPath;

  for (let pass = 0; pass < MAX_DECODE_PASSES; pass += 1) {
    try {
      canonicalPath = decodeURIComponent(canonicalPath);
    } catch {
      return null;
    }

    if (!VALID_PERCENT_OCTET.test(canonicalPath)) return canonicalPath;
  }

  return null;
}

function extractRawPathname(rawUrl) {
  if (typeof rawUrl !== 'string' || !/^https?:\/\//i.test(rawUrl)) return null;

  try {
    const parsedUrl = new URL(rawUrl);
    if (!parsedUrl.hostname || !['http:', 'https:'].includes(parsedUrl.protocol)) return null;
  } catch {
    return null;
  }

  const authorityStart = rawUrl.indexOf('://') + 3;
  let pathStart = rawUrl.length;
  for (let index = authorityStart; index < rawUrl.length; index += 1) {
    if ('/\\?#'.includes(rawUrl[index])) {
      pathStart = index;
      break;
    }
  }

  if (!rawUrl.slice(authorityStart, pathStart)) return null;

  if (pathStart === rawUrl.length || ['?', '#'].includes(rawUrl[pathStart])) return '/';

  let pathEnd = rawUrl.length;
  for (let index = pathStart; index < rawUrl.length; index += 1) {
    if (rawUrl[index] === '?' || rawUrl[index] === '#') {
      pathEnd = index;
      break;
    }
  }

  return rawUrl.slice(pathStart, pathEnd) || '/';
}

function isCanonicalPathBlocked(canonicalPath) {
  if (ACME_HTTP_01_PATH.test(canonicalPath)) return false;
  if (canonicalPath.includes('\\')) return true;

  return canonicalPath.split('/').some((segment) => {
    return (
      segment === '.' ||
      segment === '..' ||
      SENSITIVE_PATH_SEGMENT.test(segment) ||
      hasEncodedTerminator(segment, '.env') ||
      hasEncodedTerminator(segment, '.git')
    );
  });
}

export function classifyRequestUrlPath(rawUrl) {
  // Cloudflare's default incoming URL normalization happens before Worker execution and can
  // remove traversal bytes. Rules/WAF using raw.http.request.uri.path is the authoritative
  // pre-normalization layer and is planned separately; this scan protects runtimes that
  // preserve those bytes before WHATWG parsing.
  const rawPath = extractRawPathname(rawUrl);
  const canonicalPath = rawPath === null ? null : canonicalizePath(rawPath);
  return {
    blocked: canonicalPath === null || isCanonicalPathBlocked(canonicalPath),
    canonicalPath,
  };
}

export function canonicalizeRequestPath(request) {
  return classifyRequestUrlPath(request?.url).canonicalPath;
}

export function guardRequestPath(request) {
  const classification = classifyRequestUrlPath(request?.url);

  return classification.blocked ? notFoundResponse() : null;
}
