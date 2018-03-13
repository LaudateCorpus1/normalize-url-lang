'use strict';

var fs = require('fs');
var path = require('path');

var { load } = require('../publicsuffix');
var fetch = require('node-fetch');

var ietfCodes = require('lcid/lcid.json');
var iso639 = require('iso-639-3');


Promise.all([
    load(fetch)
        .then(function (suffixData) {
            return new Promise(function (resolve, reject) {
                fs.writeFileSync(path.join(__dirname, '..', 'publicsuffix.json'), JSON.stringify(suffixData, null, 2), {}, function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        }),
    genLangCodes() ])
    .catch(function (ex) {
        console.error(ex);
        process.exit(1);
    });

function genLangCodes () {
    var map = {};
    iso639.forEach(function (lang) {
        if (lang.iso6393)
            map[lang.iso6393] = true;  // 7589 3-letter codes
        if (lang.iso6391)
            map[lang.iso6391] = true;  // 136 2-letter codes
    });
    for (var code in ietfCodes) {
        var c = code.toLowerCase();
        map[c] = true;
        map[c.replace('_', '-')] = true;
        map[c.replace('_', '')] = true;
    }

    return new Promise(function (resolve, reject) {
        fs.writeFileSync(path.join(__dirname, '..', 'langcodes.json'), JSON.stringify(map, null, 2), {}, function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
