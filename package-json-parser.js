
var fs = require("fs");

module.exports = {
    getDependencies : getDependencies
};

function getDependencies(packageJsonPath, cb){
    fs.readFile(packageJsonPath, function(err, packaJsonFile){
        if(err) {
            cb(err, null);
            return;
        }

        var packageJson = JSON.parse(packaJsonFile);

        var dependencies = [];

        for(var i in packageJson.dependencies){
            dependencies.push(i + "#" + packageJson.dependencies[i]);
        }

        for(var i in packageJson.devDependencies){
            dependencies.push(i + "#" + packageJson.devDependencies[i]);
        }

        var prjId = packageJson.name + "#" + packageJson.version;

        cb(null, { prjId : prjId, deps : dependencies });

    });
}
