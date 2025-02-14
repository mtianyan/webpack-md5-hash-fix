"use strict";

var md5 = require("md5");
var fs = require('fs');
function compareModules(a,b) {
    if (a.resource < b.resource) {
        return -1;
    }
    if (a.resource > b.resource) {
        return 1;
    }
    return 0;
}

function getModuleSource (module) {
    if(module.resource){
        var ret = fs.readFileSync(module.resource.replace("?modules",""), 'utf-8');
    }else{
        var _source = module._source || {};
        var ret = _source._value || ""
    }
    return ret || "";
}

function concatenateSource (result, module_source) {
    return result + module_source;
}

function WebpackMd5Hash () {

}

WebpackMd5Hash.prototype.apply = function(compiler) {
    compiler.plugin("compilation", function(compilation) {
        compilation.plugin("chunk-hash", function(chunk, chunkHash) {
            var modules = chunk.mapModules ? chunk.mapModules(getModuleSource) : chunk.modules.map(getModuleSource);
            var source = modules.sort(compareModules).reduce(concatenateSource, ''); // we provide an initialValue in case there is an empty module source. Ref: http://es5.github.io/#x15.4.4.21
            var chunk_hash = md5(source);
            chunkHash.digest = function () {
                return chunk_hash;
            };
        });
    });
};

module.exports = WebpackMd5Hash;
