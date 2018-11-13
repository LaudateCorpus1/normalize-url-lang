'use strict';

var parseUrl = require('./url').parseUrl;

function wildcardToRegex(str, wildcard) {
    try {
        return new RegExp('^'
            + str.split(wildcard)  // split to non-wildcard parts
                .map(function (p) {
                    return p.split('')  // split to individual characters
                        .map(function (c) {
                            return '\\u{' + c.codePointAt(0).toString(16) + '}';  // convert characters to a single-character unicode match to avoid any other escaping problems
                        })
                        .join('');  // join the individual charater matches back
                    })
                    .join('.*')  // return .* in-between instead of a wilcard
            + '$', 'u');
    }
    catch (ex) {  // chrome 49 does not support the 'u' flag
        try {
            return new RegExp('^'
                + str.split(wildcard)  // split to non-wildcard parts
                    .map(function (p) {
                        return p.split('')  // split to individual characters
                            .map(function (c) {
                                return (c === '[' || c === ']' || c === '^') ? ('\\' + c) : '[' + c + ']';
                            })
                            .join('');  // join the individual charater matches back
                        })
                        .join('.*')  // return .* in-between instead of a wilcard
                + '$', 'u');
        } catch (ex49) {
            return /[]/;
        }
    }
}

function matchPath(pathName, wildcardPathName, wildcard) {
    var pathParts = pathName.split('/');
    var wildcardPathParts = wildcardPathName.split('/');

    if (pathParts.length != wildcardPathParts.length) {
        return false;
    }

    for (var i = pathParts.length - 1; i >= 0; --i) {
        var re = wildcardToRegex(wildcardPathParts[i], wildcard);
        if (!re.test(pathParts[i]))
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
