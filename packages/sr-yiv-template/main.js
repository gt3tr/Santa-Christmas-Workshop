'use strict';

var path = require('path');
var fs = require('fs');

function onBeforeBuildFinish(options, callback) {
    const cocosCreatorText = 'Cocos Creator | ';
    const indexFiledest = options.dest + '/index.html';

    var scriptDST = fs.readFileSync(indexFiledest, 'utf8'); // read main.js
    const titleTagStart = scriptDST.indexOf('<title>') + '<title>'.length;
    const titleTagEnd = scriptDST.indexOf('</title>');
    const titleNew = scriptDST.substring(titleTagStart, titleTagEnd).replace(cocosCreatorText, '');
    const sourceDirPath = options.project + '/packages/sr-yiv-template/resources';
    fs.readdirSync(sourceDirPath).forEach(function (childItemName) {
        const src = options.project + '/packages/sr-yiv-template/resources/' + childItemName;
        const dest = options.dest + '/' + childItemName;
        fs.copyFile(src, dest, (err) => {
            if (err) {
                Editor.log(err);
            } else {
                if (childItemName == 'index.html') {
                    var script = fs.readFileSync(indexFiledest, 'utf8'); // read main.js
                    script = script.replace('test', titleNew);
                    fs.writeFileSync(indexFiledest, script); // save main.js
                    Editor.log('Replacing Title ' + titleNew);
                }

                Editor.log('Replaced file' + childItemName);
            }
        });
    });

    callback();
}

module.exports = {
    load() {
        // When the package loaded
        Editor.Builder.on('before-change-files', onBeforeBuildFinish);
    },

    unload() {
        // When the package unloaded
        Editor.Builder.removeListener('before-change-files', onBeforeBuildFinish);
    },

    messages: {
        // "say-hello" () {
        //     Editor.log("Hello World!");
        // },
    },
};
