'use strict';

var punycode = require('punycode');

var DB_URL = 'https://publicsuffix.org/list/public_suffix_list.dat';

function wildcard(w) {
    return function rcompare(s1, s2) {
        var i1 = s1.length;
        var i2 = s2.length;

        while (i1 > 0 && i2 > 0) {
            --i1; --i2;

            if (s1[i1] === w || s2[i2] === w)
                return 0;

            if (s1[i1] > s2[i2])
                return 1;
            if (s1[i1] < s2[i2])
                return -1;
        }

        if (i1 < i2)
            return -1;
        if (i1 > i2)
            return 1;
        
        return 0;
    };
}

var rcompare = wildcard(null);
rcompare.wildcard = wildcard;


function parse(suffixText)  {
    return suffixText
        .split(/[\r\n]/)
        .map(function (s) { return punycode.toASCII(s.split('//')[0].trim()); })
        .filter(function (s) { return s.length != 0; })
        .sort(rcompare);
}

function load(node_fetch) {
    node_fetch = node_fetch || fetch;

    return node_fetch(DB_URL)
        .then(function (resp) {
            return resp.ok ? resp.text() : Promise.reject(DB_URL + ' ' + resp.status + ' ' + resp.statusText);
        })
        .then(function (text) {
            var parsed = parse(text);
            return parsed.reduce(function (o, e) {
                if (e.startsWith('!')) {
                    o.negMatch.push(e.substr(1));
                }
                else {
                    o.match.push(e);
                }

                return o;
            }, { match: [], negMatch: [] });
        });
}

module.exports = {
    rcompare: rcompare,
    parse: parse,
    load: load
};
