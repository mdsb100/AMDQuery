//Configurate amdquery.js
exports.amdqueryPath = '../amdquery/';

//Configurate project root path
exports.projectRootPath = '../../';

//All build files will save to outputPath
exports.outputPath = 'output/';

//mapping of path for AMD
exports.pathVariable = {

}

//All apps entrance - get them from app/*.js(only one segment)
exports.apps = {
  document: {
    path: "../document/app/app"
  }
}

exports.defines = {
  test: {
    path: "../build/test/test",
    directory: [ "ui/" ]
  }
}

//Compress level of JS Minifier
exports.levelOfJSMin = 3;
/*
minimal:1,//ratio:75%
conservative:2,//ratio:68%
agressive:3//ratio:67%
*/

//Compress configuration of UglifyJS
exports.uglifyOptions = {
  strict_semicolons: false,
  mangle_options: {
    mangle: true,
    toplevel: false,
    defines: null,
    except: null,
    no_functions: false
  },
  squeeze_options: {
    make_seqs: true,
    dead_code: true,
    no_warnings: false,
    keep_comps: true,
    unsafe: false
  },
  gen_options: {
    indent_start: 0,
    indent_level: 4,
    quote_keys: false,
    space_colon: false,
    beautify: false,
    ascii_only: false,
    inline_script: false
  }
};