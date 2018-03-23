'use strict';

var parseUrl = require('./url').parseUrl;

function matchPath(pathName, wildcardPathName, wildcard) {
    var path = pathName.split('/');
    var wildcardPath = wildcardPathName.split('/');

    if (path.length != wildcardPath.length) {
        return false;
    }

    for (var i = path.length - 1; i >= 0; --i) {
        if (wildcardPath[i] != wildcard && path[i] != wildcardPath[i])
            return false;
    }

    return true;

}

function matchUrl(url, wildcardUrl, wildcard) {
    if (typeof wildcard === 'undefined') {
        wildcard = '*';
    }

    // wildcard such as * is not a valid domain and path character, so we need to replace it before parsing
    var validCharWildcard = wildcard;
    do {
        validCharWildcard = Math.floor(Math.random() * 0x10000).toString(16);
    } while (wildcardUrl.indexOf(validCharWildcard) != -1);
    var wloc = parseUrl(wildcardUrl.split(wildcard).join(validCharWildcard));
    var loc = parseUrl(url);

    var domainRe = new RegExp(
        wloc.hostname.replace(new RegExp(validCharWildcard.split('').map(function (w) { return '[' + w + ']'; }).join(''), 'g'), '((.+[.])|^)'));

    if (!loc.hostname.match(domainRe)) {
        return false;
    }

    return matchPath(loc.pathname, wloc.pathname, validCharWildcard);
}

module.exports = {
    matchPath: matchPath,
    matchUrl: matchUrl
};
