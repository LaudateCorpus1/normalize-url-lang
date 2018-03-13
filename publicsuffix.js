'use strict';

var punycode = require('punycode');
var rcompare = require('./search').rcompare;

var DB_URL = 'https://publicsuffix.org/list/public_suffix_list.dat';


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
    parse: parse,
    load: load
};
