'use strict';

var punycode = require('punycode');

var PATH_TERMINATION_CHARS = /[#?;]/;

/**
 * split url to components also known from window.location and strip some extra parts, such as ; (often used as a session id delimiter)
 * mostly assumes the url is valid
 * @param {string|object} url string url or window.location
 * @return parsed url in a window.location format or null on parse error
 */
function parseUrl(url) {
    var parts;

    if (typeof url !== 'string') {
        parts = JSON.parse(JSON.stringify(url));
    }
    else {
        var match = url.match(/^([0-9A-Za-z]+[:])[/][/]([^@/]+@)?([^:/]+)([:][0-9]+)?([/].*)?$/);
        if (!match)
            return null;
        parts = {
            href: url,
            protocol: match[1].toLowerCase(),
            host: punycode.toASCII(match[3].toLowerCase()) + (match[4] ? match[4] : ''),
            hostname: punycode.toASCII(match[3].toLowerCase()),  // punyencoing should not be necessary in most cases, as window.location already punyencodes the domain
            port: (match[4] ? match[4].substr(1) : ''),
            pathname: match[5] || '',
        };
    }

    if (parts.pathname) {
        var i = parts.pathname.search(PATH_TERMINATION_CHARS);
        if (i != -1) {
            parts.pathname = parts.pathname.substr(0, i);
        }
    }

    return parts;
}

module.exports = {
    parseUrl: parseUrl
};
