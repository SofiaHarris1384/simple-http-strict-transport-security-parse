/**
 * Represents a parsed HTTP Strict Transport Security policy.
 *
 * @typedef {Object} HSTSPolicy
 * @property {number} maxAge - The max-age directive in seconds.
 * @property {boolean} includeSubDomains - Whether the includeSubDomains directive is present.
 * @property {boolean} preload - Whether the preload directive is present.
 */

/**
 * Parses an HSTS header string into a structured policy object.
 *
 * The parser is deliberately forgiving: it ignores unknown directives and
 * tolerates whitespace around commas and equals signs. Directive names are
 * matched case-insensitively, as required by RFC 6797. If a directive appears
 * multiple times, the last occurrence wins (this matches the behaviour of
 * common browsers and avoids ambiguity).
 *
 * If the header is missing, empty, or does not contain a valid max-age
 * directive, the function returns null. This is a deliberate choice: a policy
 * without max-age is not a valid HSTS policy and should not be cached.
 *
 * @param {string} header - The raw header value, e.g. "max-age=31536000; includeSubDomains".
 * @returns {HSTSPolicy|null} The parsed policy, or null if invalid.
 */
export function parseHSTS(header) {
  if (typeof header !== 'string' || header.trim() === '') {
    return null;
  }

  const directives = header.split(';');
  let maxAge = null;
  let includeSubDomains = false;
  let preload = false;

  for (const rawDirective of directives) {
    const directive = rawDirective.trim();
    if (directive === '') {
      continue;
    }

    const eqIndex = directive.indexOf('=');
    let name;
    let value;

    if (eqIndex === -1) {
      name = directive;
      value = null;
    } else {
      name = directive.slice(0, eqIndex).trim();
      value = directive.slice(eqIndex + 1).trim();
    }

    const lowerName = name.toLowerCase();

    if (lowerName === 'max-age') {
      if (value === null) {
        // max-age requires a value; ignore if missing.
        continue;
      }
      const parsed = Number(value);
      if (Number.isInteger(parsed) && parsed >= 0) {
        maxAge = parsed;
      }
      // Invalid max-age values are ignored rather than causing the whole
      // parse to fail, because a malformed max-age should not invalidate
      // other valid directives.
    } else if (lowerName === 'includesubdomains') {
      // The directive is a flag; its value is ignored.
      includeSubDomains = true;
    } else if (lowerName === 'preload') {
      preload = true;
    }
    // Unknown directives are silently ignored.
  }

  if (maxAge === null) {
    return null;
  }

  return { maxAge, includeSubDomains, preload };
}
