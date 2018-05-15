'use strict';

var search = require('./search').search;
var rcompare = require('./search').rcompare;
var parseUrl = require('./url').parseUrl;

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
function stripDomain(suffixData, domain, wildcard) {
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

    return ((typeof wildcard === 'string') ? wildcard : '') + domainParts.slice(domainParts.length - max).join('.');
}

var langcodes = require('./langcodes.json');
var TWO_CHAR_CODE = /^[a-z]{2}([-_]?[a-z]{2})?$/;  // any two characters or pt-pt or pt_br

function stripPath(path, wildcard) {
    var parts = decodeURIComponent(path).split('/');
    var partslc = decodeURIComponent(path).toLowerCase().split('/');

    if (typeof wildcard === 'string') {
        for (var i = partslc.length - 1; i >= 0; --i) {
            if (partslc[i].match(TWO_CHAR_CODE) || langcodes[partslc[i]])
                parts[i] = wildcard;
        }
    }
    else {
        for (var i = partslc.length - 1; i >= 0; --i) {
            if (partslc[i].match(TWO_CHAR_CODE) || langcodes[partslc[i]])
                parts.splice(i, 1);
        }
    }

    return parts.join('/');
}

function normalizeUrl(suffixData, url, wildcard) {
    var loc = parseUrl(url);

    return loc.protocol + '//' + stripDomain(suffixData, loc.hostname, wildcard) + (loc.port ? (':' + loc.port) : '') + stripPath(loc.pathname, wildcard);
}

module.exports = {
    stripDomain: stripDomain,
    stripPath: stripPath,
    normalizeUrl: normalizeUrl
};
