var Promise = require('bluebird');

var pomParserAsync = Promise.promisifyAll(require('./pom-xml-parser'));
var packageJsonParserAsync = Promise.promisifyAll(require('./package-json-parser'));
var androidGradleParserAsync = Promise.promisifyAll(require('./android-gradle-parser'));
var podfileParserAsync = Promise.promisifyAll(require('./podfile-parser'));

module.exports = {
    parsePomXml :  function(pathPom){
        return pomParserAsync.getDependenciesAsync(pathPom);
    },
    parsePackageJson : function(pathPackageJson){
        return packageJsonParserAsync.getDependenciesAsync(pathPackageJson);
    },
    parseAndroidGradle : function(rootPath){
        return androidGradleParserAsync.getDependenciesAsync(rootPath);        
    },
    parsePodfileOrPodspecfile : function(pathPodfileOrPodspec){
        return podfileParserAsync.getDependenciesAsync(pathPodfileOrPodspec);        
    }
};