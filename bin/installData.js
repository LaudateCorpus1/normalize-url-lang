'use strict';

var fs = require('fs');
var path = require('path');

var { load } = require('../publicsuffix');
var fetch = require('node-fetch');

var _DOMParser = require('xmldom-sre').DOMParser;
var wgxpath = require('wicked-good-xpath');
class DOMParser extends _DOMParser {
    parseFromString(str) {
        var window = {};
        window.document = super.parseFromString(str);
        wgxpath.install(window);
        for (var key in window) {
            if (key !== 'document') {
                global[key] = window[key];
            }
        }
        return window.document;
    }
}

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
        loadLangCodes() ])
    .catch(function (ex) {
        console.error(ex);
        process.exit(1);
    });

function loadLangCodes () {
    return fetch('http://unicode.org/repos/cldr/trunk/common/supplemental/supplementalData.xml')
        .then(function (resp) {
            return resp.ok ? resp.text() : Promise.reject(DB_URL + ' ' + resp.status + ' ' + resp.statusText);
        })
        .then(function (text) {
            var codes = {};
            var domParser = new DOMParser();
            var xml = domParser.parseFromString(text);
            
            var langs = xml.evaluate('languageData/language[not(@alt="secondary")]', xml.documentElement, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);

            var lang = langs.iterateNext();
            while (lang) {
                var type = lang.getAttribute('type').toLowerCase();
                codes[type] = true;
                if (lang.hasAttribute('territories')) {
                    var territories = lang.getAttribute('territories').toLowerCase().split(' ');
                    territories.reduce(function (o, t) {
                        o[type + '-' + t] = true;
                        o[type + '_' + t] = true;
                        return o;
                    }, codes);
                }

                lang = langs.iterateNext();
            }

            var territoryGroups = xml.evaluate('parentLocales/parentLocale[not(@parent="root")]', xml.documentElement, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
            var group = territoryGroups.iterateNext();
            while (group) {
                var parent = group.getAttribute('parent').toLowerCase();
                codes[parent.replace(/_/g, '-')] = true;
                codes[parent.replace(/-/g, '_')] = true;
                group = territoryGroups.iterateNext();                
            }

            return new Promise(function (resolve, reject) {
                fs.writeFileSync(path.join(__dirname, '..', 'langcodes.json'), JSON.stringify(codes, null, 2), {}, function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
                    
        });
}
