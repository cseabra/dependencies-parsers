var Promise = require('bluebird');
var g2js = require("gradlejs");

module.exports = {
  getDependenciesAsync: getDependenciesAsync
}

function getDependenciesAsync(buildGradlePath) {
  return g2js.parseFile(buildGradlePath).then(function (representation) {
    return new Promise(function (resolve, reject) {
      try {
        var prjId = representation.android.defaultConfig.applicationId.replace(/"/g, "") + "#" + representation.android.defaultConfig.versionName.replace(/"/g, "");
        var dependencies = [];

        if(Array.isArray(representation.dependencies.compile.length)){
          for (var i in representation.dependencies.compile) {
            var dependency = representation.dependencies.compile[i].replace(/'/g, "").replace(/\\/g, "").replace(/:/g, "#");

            //Se não tem espaços
            if (dependency.indexOf(" ") == -1) {
              dependencies.push(dependency);
            }
          }
        }

        resolve({ prjId: prjId, deps: dependencies });
      } catch (err) {
        reject("Erro ao processar build.gradle: " + JSON.stringify(err));
      }
    })
  });
}