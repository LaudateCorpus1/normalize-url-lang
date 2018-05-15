Strip a local part of a domain and language identifier from a path
==================================================================

Extract a unique and language-independent part of a URL, e.g.

```
let { normalizeUrl } = require('normalize-url-lang');

normalizeUrl(publicSuffixData, 'https://www.avast.com/en-US/index.html?q=avast');
 -> https://avast.com/index.html
```

Stripped parts can be replaced by a wildcard and use for URL comparison:

```
let { matchUrl } = require('normalize-url-lang/match');

normalizeUrl(publicSuffixData, 'https://www.avast.com/en-US/index.html?q=avast', '*');
 -> https://*avast.com/*/index.html

matchUrl('https://avast.com/de-DE/index.html', 'https://*avast.com/*/index.html', '*');
 -> true
```

publicsuffix.org is used to distinguish local and public parts of a domain.
The data has about 160 kB. This can either be loaded in runtime by

```
let { load } = require('normalize-url-lang/publicsuffix');

load().then(publicSuffixData => ...)
```

or include the ones generated at _install_ in your package:
```
let publicSuffixData = require('normalize-url-lang/publicsuffix.json');
```

Alternatives: [tld](https://github.com/oncletom/tld.js)

API
---

### normalizeUrl(suffixData, url, wildcard)
- suffixData: data obtained by `require('normalize-url-lang/publicsuffix.json')` or `require('normalize-url-lang/publicsuffix').load()`
- url: URL string or parsed URL in a Location format
- wildcard (optional): if present, stripped domain + path parts will be marked by the wildcard
- return URL string with all mutable parts removed ('www', language codes, session id, query, fragment)

`import { normalizeUrl } from 'normalize-url-lang';`

Example:
```
normalizeUrl(suffixData, 'http://www.example.com/en_us/search.html?q=abc')
  -> http://example.com/search.html
```
```
normalizeUrl(suffixData, {
    protocol: 'http:',
    host: 'www.example.com',
    pathname: '/en_us/search.html',
    search: '?q=abc',
    ...
  }, '*')
  -> http://*example.com/*/search.html
```

### stripDomain(suffixData, domain, wildcard)
- suffixData: data obtained by `require('normalize-url-lang/publicsuffix.json')` or `require('normalize-url-lang/publicsuffix').load()`
- domain: full domain name
- wildcard (optional): if present, stripped parts will be marked by the wildcard
- return domain stripped from left by publicsuffix.org data

`import { stripDomain } from 'normalize-url-lang';`

Example:
```
stripDomain(suffixData, 'www.example.com', '*')
  -> *example.com
```
```
stripDomain(suffixData, 'www.example.com')
  -> example.com
```

### stripPath(path, wildcard)
- path: plain URL path, no query strings, no fragments
- wildcard (optional): if present, stripped parts will be marked by the wildcard
- return path with language parts removed

`import { stripPath } from 'normalize-url-lang';`

Example:
```
stripPath('/de/index.html', '*')
  -> /*/index.html
```
```
stripPath('/pt/pt-BR/index.html')
  -> /index.html
```

### matchUrl(url, wildcardUrl, wildcard)
- url, wildcardUrl: URLs to compare
- wildcard: wildcard used in wilcardUrl; default: '*'
- return true / false

`import { matchUrl } from 'normalize-url-lang/match';`

Example:
```
matchUrl('https://www.abc.example.com/de/de-ch/index.html;jsessionid=abcd', 'https://*example.com/*/*/index.html')
  -> true
```

### matchPath(pathName, wildcardPathName, wildcard)
- pathName, wildcardPathName: URL paths to compare
- wildcard: wildcard used in wildcardPathName
- return true / false

`import { matchPath } from 'normalize-url-lang/match';`

Example:
```
matchPath('/de/index.de-ch.html', '/*/index.*.html')
  -> true
```

### parseUrl(url)
- url: string or a Location-compatible object
- return Location-compatible object with pathname trimmed from the leftmost invalid character (any of !$&'(),;=:@?#)

`import { parseUrl } from 'normalize-url-lang/url';`

Example:
```
parseUrl('https://www.bank.cy/IBS/ControllerServlet;jsessionid=0001_9xUJ:VLQ0B')
  -> { protocol: 'https:', hostname: 'www.bank.cy', pathname: '/IBS/ControllerServlet' }
```
