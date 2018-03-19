Strip a local part of a domain and language identifier from a path
==================================================================

Extract a unique and language-independent part of a URL, e.g.

```
let { normalizeUrl } = require('normalize-url-lang');

normalizeUrl(suffixData, 'https://www.avast.com/en-US/index.html?q=avast');
 -> https://avast.com/index.html
```

Stripped parts can be replaced by a wildcard and use for URL comparison:

```
let { matchUrl } = require('normalize-url-lang/url');

normalizeUrl(suffixData, 'https://www.avast.com/en-US/index.html?q=avast', '*');
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
