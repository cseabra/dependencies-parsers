var fs = require('fs');

module.exports = {
    getDependencies: getDependencies
}

/**
 * @param caminho do podfile ou *.podspec 
 * @param cb: callback(err, {prjId: string, deps:string[]})
 */
function getDependencies(podfilePath, cb) {
    var podParser =
        podfilePath.endsWith('Podfile') ? Podfile :
            (podfilePath.endsWith('.podspec') ? Podspec : undefined);

    if (!podParser) {
        cb('Apenas arquivos Pofile ou podspec podem ser interpretados', null);
        return;
    }

    fs.readFile(podfilePath, 'UTF-8', function (err, data) {
        if (err) {
            cb('Erro ao ler arquivo: ' + podfilePath + ". " + JSON.stringify(err), null);
            return;
        }
        try {
            var podMeta = new podParser(data);

            var result = {
                prjId: podMeta.prjId,
                deps: podMeta.deps
            };

            cb(null, result);
        } catch (err) {
            cb(err, null);
        }
    });
}

function Podspec(content) {
    var self = this;
    this.propertiesByAlias = [];
    this.deps = [];
    this.prjId = "";

    this.init = function (content) {
        var podsSpecNewRegex = /Pod::Spec.new(.*)/g
        var podsSpecNewLines = content.match(podsSpecNewRegex);

        if (!podsSpecNewLines) {
            throw new Error("Nenhuma linha com o conteúdo 'Pod::Spec.new' foi encontrada. Arquivo podspec inválido.");
        }

        var aliases = [];
        for (i in podsSpecNewLines) {
            var podsSpecNewLine = podsSpecNewLines[i];
            aliases.push(podsSpecNewLine.substr(podsSpecNewLine.indexOf('|') + 1, podsSpecNewLine.lastIndexOf('|') - podsSpecNewLine.indexOf('|') - 1));
        }

        if (aliases.length == 0) {
            throw new Error("Não foi possível definir um alias do arquivo podspec. Nada encontrado entre |*|");
        }

        for (var i in aliases) {
            var alias = aliases[i];
            var aliasRegex = new RegExp(alias + "\\.(.*)", "g");
            var podSpecLines = content.match(aliasRegex);

            self.propertiesByAlias = self.propertiesByAlias.concat(getPropsPodspec(alias, podSpecLines))
            self.deps = self.deps.concat(getDepsPodspec(alias, podSpecLines))
        }

        if (self.propertiesByAlias.length == 0) {
            throw new Error("Não foi possível recuperar propriedades do podspec.");
        }

        var properties = this.propertiesByAlias[0];
        self.prjId = properties.name + '#' + properties.version;
    }

    function getPropsPodspec(alias, lines) {
        var result = {};
        for (var i in lines) {
            var line = lines[i];
            var keyValue;

            if (line.indexOf('~>') > -1) continue;
            keyValue = getAliasPodspecKeyValue(alias + '.', line);
            result[keyValue[0]] = keyValue[1];
        }
        return result;
    }

    function getDepsPodspec(alias, lines) {
        var result = [];
        for (var i in lines) {
            var line = lines[i];
            var keyValue;
            if (line.indexOf('~>') == -1) continue;
            keyValue = getDependency(alias + '.dependency', line);
            result.push(keyValue[0] + '#' + keyValue[1]);
        }
        return result;
    }


    this.init(content);
}

function Podfile(content) {
    var self = this;
    this.deps = [];
    this.prjId = "";


    this.init = function (content) {
        self.prjId = buildPrjId(content);
        fillDeps(content, self.deps);
    }

    function buildPrjId(content) {
        var podsRegex = /target\s+'(.*?)'/;
        var found = content.match(podsRegex);
        if (found.length == 0) throw new Error("Nenhum target encontrado no Podfile");

        var line = found[0];
        return cleanString(line.substr(line.indexOf('\''), found[0].lastIndexOf('\'') - found[0].indexOf('\''))) + '#PODFILE';
    }

    function fillDeps(content, deps) {
        var podsRegex = /pod '(.*?)'(.*)/g
        var found = content.match(podsRegex);

        for (var i in found) {
            var podInfo = getDependency('pod', found[i]);
            var pod = podInfo[0];
            var version = podInfo[1];
            deps.push(pod + '#' + (version || 'LATEST'));
        }
    }

    this.init(content);
}

function cleanString(str) {
    return str
        .replace(/\s/g, '') // remove todos os espacos
        .replace(/'/g, '') // remove todos os apostrofos
        .replace(/"/g, '') // remove todas as aspas
        .replace(/:/g, '') // remove todos os :
        .replace(/\{/g, '') // remove todos os {
        .replace(/\}/g, '') // remove todos os }
        .replace(/,/g, '') // remove todos os ,
}

function cleanString2(str) {
    return str
        .replace(/'/g, '') // remove todos os apostrofos
        .replace(/"/g, '') // remove todas as aspas
        .replace(/\{/g, '') // remove todos os {
        .replace(/\}/g, '') // remove todos os }
        .replace(/\]/g, '') // remove todos os ]
        .replace(/\[/g, '') // remove todos os [
        .replace(/,/g, '') // remove todos os ,
        .trim()
}

function getAliasPodspecKeyValue(prefix, line) {
    var result = line.split('=');
    result[0] = cleanString(result[0]).replace(prefix, '');
    result[1] = cleanString2(result[1]);
    return result;
}

function getDependency(prefix, line) {
    return cleanString(line)
        .replace(prefix, '')
        .split('~>');
}







//tests
/*
getDependencies('/Users/cseabra/codes/mine/dependencies-parser/ios-cocoapods/Podfile', function (err, prj) {
    if (err) {
        console.log(err);
        return;
    }
    console.log(" *********** PODFILE")
    console.log(prj);
});


getDependencies('/Users/cseabra/codes/mine/dependencies-parser/ios-cocoapods/ios-cocoapods.podspec', function (err, prj) {
    if (err) {
        console.log(err);
        return;
    }

    console.log(" *********** PODSPEC")
    console.log(prj);
});*/