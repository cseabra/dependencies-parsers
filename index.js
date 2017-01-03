var Promise = require('bluebird');

var pomParserAsync = Promise.promisifyAll(require('./pom-xml-parser'));
var packageJsonParserAsync = Promise.promisifyAll(require('./package-json-parser'));
var buildGradleParserAsync = require('./build-gradle-parser');

module.exports = {
    parsePomXml :  function(pathPom){
        return pomParserAsync.getDependenciesAsync(pathPom);
    },
    parsePackageJson : function(pathPackageJson){
        return packageJsonParserAsync.getDependenciesAsync(pathPackageJson);
    },
    parseBuildGradle : function(pathBuildGradleParser){
        return buildGradleParserAsync.getDependenciesAsync(pathBuildGradleParser);        
    }
};