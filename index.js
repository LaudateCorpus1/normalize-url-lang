'use strict';

var search = require('./search').search;
var rcompare = require('./search').rcompare;
var punycode = require('punycode');

var SUSPICIOUS_PATH_CHARS = /[!$&'()*,;=:@?#]/;

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
        var i = parts.pathname.search(SUSPICIOUS_PATH_CHARS);
        if (i != -1) {
            parts.pathname = parts.pathname.substr(0, i);
        }
    }

    return parts;
}

function lastPartCompare(suffix, domainParts) {
    var suffixParts = suffix.split('.');

    return rcompare(suffixParts[suffixParts.length - 1], domainParts[domainParts.length - 1]);
}

function commonParts(suffix, domainParts) {
    var suffixParts = suffix.split('.');
    var is = suffixParts.length;
    var id = domainParts.length;

    while (is > 0 && id > 0) {
        --is; --id;

        if (suffixParts[is] === '*')
            continue;

        var cmp = rcompare(suffixParts[is], domainParts[id]);
        if (cmp != 0)
            return domainParts.length - id - 1;
    }

    return domainParts.length - id;
}

/** @return matching domain parts */
function stripDomain(suffixData, domain) {
    var domainParts = domain.split('.');
    var randomMatch = search(suffixData.match, domainParts, lastPartCompare);

    if (randomMatch === null) {
        return domain;
    }

    var length = suffixData.match.length;
    var max = 0;
    var m;
    var i;

    i = randomMatch;
    while (i < length && (m = commonParts(suffixData.match[i], domainParts)) > 0) {
        if (m > max) {
            if (search(suffixData.negMatch, domainParts.slice(domainParts.length - m).join('.'), rcompare) === null) {
                max = m;
            }
        }
        ++i;
    }
    i = randomMatch - 1;
    while (i >= 0 && (m = commonParts(suffixData.match[i], domainParts)) > 0) {
        if (m > max) {
            if (search(suffixData.negMatch, domainParts.slice(domainParts.length - m).join('.'), rcompare) === null) {
                max = m;
            }
        }
        --i;        
    }

    if (max === 0) {
        max = 1;  // there was at least one matching component
    }

    if (max < domainParts.length) {
        ++max;
    }

    return domainParts.slice(domainParts.length - max).join('.');
}

var langcodes = require('./langcodes.json');

function stripPath(path) {
    var parts = decodeURIComponent(path).split('/');
    var partslc = decodeURIComponent(path).toLowerCase().split('/');

    for (var i = partslc.length - 1; i >= 0; --i) {
        if (langcodes[partslc[i]])
            parts.splice(i, 1);
    }
    return parts.join('/');
}

module.exports = {
    parseUrl: parseUrl,
    stripDomain: stripDomain,
    stripPath: stripPath
};
