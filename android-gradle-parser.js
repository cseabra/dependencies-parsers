var bluebird = require('bluebird');
var utils = require("./utils");
var g2js = require("gradlejs");

module.exports = {
  getDependencies: getDependencies
}

function getDependencies(rootPath, cb) {
  getPaths(rootPath, function (err, paths) {
    readDependencies(paths, 0, [], function (err, result) {
      var prjId = rootPath.substr(rootPath.lastIndexOf('/') + 1, rootPath.length) + '#' + result.version;
      cb(err, { prjId: prjId, deps: result.deps });
    });
  });
}

function getBuildGradleOrSettingsGradle(path) {
  var glob = require('glob');

  var filesArr = [
    'settings.gradle',
    'build.gradle'
  ];

  for (var i in filesArr) {
    var filesResult = glob.sync(filesArr[i], { cwd: path, nocase: true });

    if (filesResult.length > 0) return path + '/' + filesResult[0];
  }

  return null;
}

function getPaths(rootPath, cb) {
  var settingsOrGradle = getBuildGradleOrSettingsGradle(rootPath);

  if (!settingsOrGradle) {
    cb('O path \'' + rootPath + '\'Não é um projeto android gradle válido, pois não tem um arquivo settings.gradle ou build.gradle');
  }

  g2js.parseFile(settingsOrGradle).then(function (representation) {
    //Se é settings.gradle
    if (representation.include) {
      var modules = representation.include.match(/':(.*?)'/g);

      if (modules && modules.length == 0) {
        cb('settings.gradle inválido!');
        return;
      }

      for (var i in modules) {
        modules[i] = rootPath + '/' + modules[i].replace(/'/g, "").replace(/:/g, '');
      }

      modules.push(rootPath);

      cb(null, modules);
    } else { //Se não tiver settings.gradle
      cb(null, [rootPath]);
    }
  });
}

function readDependencies(paths, i, deps, cb, version) {
  var path = paths[i];

  //Se não tem mais o que percorrer pára recursividade e chama callback;
  if (!path) {
    cb(null, { version: version, deps: utils.toUnique(deps) });
    return;
  }

  var buildGradle = path + '/build.gradle';

  g2js.parseFile(buildGradle).then(function (representation) {
    try {
      version = (version || '') + representation.android.defaultConfig.versionName.replace(/"/g, "");//representation.android.defaultConfig.applicationId.replace(/"/g, "") + "#" + representation.android.defaultConfig.versionName.replace(/"/g, "");

      if (Array.isArray(representation.dependencies.compile)) {
        for (var i in representation.dependencies.compile) {
          var dependency = representation.dependencies.compile[i].replace(/'/g, "").replace(/\\/g, "").replace(/:/g, "#");

          //Se não tem espaços
          if (dependency.indexOf(" ") == -1) {
            deps.push(dependency);
          }
        }
      }
      readDependencies(paths, ++i, deps, cb, version);
    } catch (err) {
      cb("Erro ao processar '" + path + "' alguma seção esperada não deve existir." + JSON.stringify(err));
    }
  }, function(err){
    readDependencies(paths, ++i, deps, cb, version);
  });
}