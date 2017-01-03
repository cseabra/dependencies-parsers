var Promise = require('bluebird');

var pomParserAsync = Promise.promisifyAll(require('./pom-xml-parser'));
var packageJsonParserAsync = Promise.promisifyAll(require('./package-json-parser'));
var buildGradleParserAsync = require('./build-gradle-parser');

module.exports = {
    pomXmlParser : pomParserAsync.getDependenciesAsync,
    packageJsonParser : packageJsonParserAsync.getDependenciesAsync,
    buildGradleParser : buildGradleParserAsync.getDependenciesAsync
};