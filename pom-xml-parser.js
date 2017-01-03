module.exports = {
    getDependencies: getDependencies
}

var pomParser = require("pom-parser");

/**
 * @param pomPath o caminho do pom.xml
 * @param cb: callback(err, {prjId: string, deps:string[]})
 * 
 * Ex.:
 * 
 * getDependencies("/java-maven/pom.xml", function(err, obj){
 *     if(err) {
 *         console.log(err);
 *         return;
 *     }
 * 
 *     console.log('Id do projeto: ' + obj.prjId);
 * 
 *     console.log(' ');
 *     console.log('Dependencias: ');
 *     console.log(' ');
 * 
 *     for(var i in obj.deps){
 *         console.log(obj.deps[i]);
 *     }
 * });
 * 
 */
function getDependencies(pomPath, cb){
    // The required options, including the filePath. 
    // Other parsing options from https://github.com/Leonidas-from-XIV/node-xml2js#options 
    var opts = {
        filePath: pomPath, // The path to a pom file 
    };
    // Parse the pom based on a path 
    pomParser.parse(opts, function(err, pomResponse) {
        if (err) {
            cb(err, []);
            return;
        }

        var deps = [];
        var result = {
            deps: deps,
            prjId: ''
        };

        if(!pomResponse.pomObject.project.dependencies) {
            cb(null, result);
            return;
        }

        var dependencies = pomResponse.pomObject.project.dependencies.dependency;

        result.prjId = pomResponse.pomObject.project.groupid + "#" + pomResponse.pomObject.project.artifactid + "#" + pomResponse.pomObject.project.version;

        try{
            for(var i in dependencies){
                var dependency = dependencies[i];

                deps.push(getIdDependencyFromPom(dependency, pomResponse.pomObject.project.properties));
            }
            cb(null, result);
        } catch (err) {
            cb(err, null);
        }
    });
}


/**
 * @param dependency: Um objeto com esse formato: { artifactid: string, groupid: string, version: string}
 * @param properties: Um objeto com com as propriedades do pom
 * @return Retorna um id no formato: groupid#artifactid#version
 */
function getIdDependencyFromPom(dependency, properties){
    if(!dependency) throw new Error("O argumento dependency não pode estar vazio");

    var temTodasAsPropriedades = dependency.artifactid && dependency.groupid && dependency.version;
    
    if(!temTodasAsPropriedades) throw new Error("As propriedades artifactid, groupid e version são obrigatórios numa dependência maven.");

    //Se contém '${' pega informações do properties
    var versionNumber = getVersionNumber(dependency.version, properties);

    return dependency.groupid + "#" + dependency.artifactid + "#" + versionNumber;
}

/**
 * @prop propriedade no formato ${NOME_PROPRIEDADE}
 * returns Retorna apenas o nome da propriedade sem o dólar e as chaves
 */
function getVersionNumber(version, properties){
    if(version.indexOf('${') != -1){
        if(!properties) throw new Error("O nó propertie não está definido.");
        
        version = version.replace('${', '').replace('}', '');
        if(!properties[version]) throw new Error("Não foi possível encontrar a propriedade no pom.xml: ${" + version + "}");
        version = properties[version];
    }

    return version;
}