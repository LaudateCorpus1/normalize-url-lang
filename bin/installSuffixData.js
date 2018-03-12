'use strict';

var fs = require('fs');
var path = require('path');

var { load } = require('../publicsuffix');
var fetch = require('node-fetch');

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
    })
    .catch(function (ex) {
        console.error(ex);
        process.exit(1);
    });
