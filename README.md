# simple-http-strict-transport-security-parse

Parses HTTP Strict Transport Security (HSTS) header values into structured policy objects, extracting `max-age`, `includeSubDomains`, and `preload` directives with case-insensitive handling.

```js
import { parseHSTS } from 'simple-http-strict-transport-security-parse';

const policy = parseHSTS('max-age=31536000; includeSubDomains; preload');
// { maxAge: 31536000, includeSubDomains: true, preload: true }
```

## Why this exists

HSTS headers are deceptively simple, but real-world headers are messy: directive names arrive in mixed case, spacing around semicolons and equals signs varies, and unknown directives appear alongside the standard ones. A naive `split`-and-`indexOf` parser either crashes on unexpected input or silently produces a policy that browsers would reject.

This library exists to turn a raw header string into a predictable object that you can use for logging, policy auditing, or feeding into a security dashboard. The main trade-off is strictness about `max-age`: a header without a valid `max-age` is treated as invalid and returns `null`, because an HSTS policy without a max-age cannot be enforced. Unknown directives are ignored rather than causing a parse failure, which keeps the parser useful even when new extensions are added to the header.

## Edge cases

- **Duplicate directives:** the last occurrence wins. This matches the behaviour of common browsers and avoids ambiguity when a header is assembled from multiple sources.
- **Invalid `max-age` values:** values that are not non-negative integers (e.g. `abc`, `12.5`, `-1`) are ignored. If no valid `max-age` remains, the function returns `null`.
- **Whitespace and case:** directive names are matched case-insensitively, and whitespace around semicolons and equals signs is trimmed.
- **Empty or non-string input:** returns `null`.

The exported function is `parseHSTS(header)`. It returns an object with `maxAge` (number), `includeSubDomains` (boolean), and `preload` (boolean), or `null` when the header does not contain a valid policy.
