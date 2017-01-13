## Installation

```
npm i dependencies-parsers --save
```

## Using

```
var parsers = require('dependencies-parsers');

//Parse a pom file
parsers.parsePomXml(__dirname + '/java-maven/pom.xml')
    .then(function (obj) {
        console.log(obj.prjId);
        console.log(obj.deps);
    })
    .catch(function (err) {
        console.log(err);
    });


//Parse a package.json file
parsers.parsePackageJson(__dirname + '/nodejs-npm/package.json')
    .then(function (obj) {
        console.log(obj.prjId);
        console.log(obj.deps);
    })
    .catch(function (err) {
        console.log(err);
    });

//Parse a build.gradle file
parsers.parseBuildGradle(__dirname + '/android-gradle/app/build.gradle')
    .then(function (obj) {
        console.log(obj.prjId);
        console.log(obj.deps);
    })
    .catch(function (err) {
        console.log(err);
    });
```

## TODO
* Implement a podfile parsers
* Verify if there is a dependency management tool for windows phone.