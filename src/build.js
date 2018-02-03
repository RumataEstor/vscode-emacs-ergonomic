function processLFSPackage(original) {
    var save = false;
    var replace = [];

    function copyForMac(original) {
        var mac = original.key.replace(/\bctrl\b/g, 'cmd');
        if (mac == original.key) return null;

        // This complexity is required to make sure the 'mac' field is added right after the 'key' field.
        // Even though keys in objects are said to be orderless the order of adding properties is preserved.

        var result = {};
        for (var k in original) {
            result[k] = original[k];
            if (k === 'key') result.mac = mac;
        }
        return result;
    }

    original.contributes.keybindings.forEach(original => {
        if (original.mac) return;

        var replacement = copyForMac(original);
        if (!replacement) return;

        // append one with mac binding set
        replace.push(replacement);

        // remove original
        original.command = "-" + original.command;
        replace.push(original);

        save = true;
    });

    if (save) {
        var package = require('../package.json');
        package.contributes.keybindings = replace;
        package.version = original.version;

        var fs = require('fs');
        fs.writeFileSync(__dirname + '/../package.json', JSON.stringify(package, null, 4) + "\n");
        console.log("Updated successfully.");
    } else {
        console.log("No changes needed.")
    }
}

(function (stdin) {
    var chunks = [];

    stdin.setEncoding('utf8');
    stdin.on('data', function (chunk) {
        chunks.push(chunk);
    });
    stdin.on('end', function () {
        processLFSPackage(JSON.parse(chunks.join()));
    });

    stdin.resume();
})(process.stdin);
