 var buildConfig = {
   debug: false
 }

 var argvs = process.argv;

 var argvsMap = {
   "-d": function( ) {
     buildConfig.debug = true;
   }
 }

 var relativePath = process.argv[ 1 ].replace( /([\\\/])[^\\\/]*$/, '$1' );

 var buildConfigFile = process.argv[ 2 ];
 if ( buildConfigFile && /\.js/.test( buildConfigFile ) ) {
   if ( !( /^\.*\//.test( buildConfigFile ) ) ) {
     buildConfigFile = './' + buildConfigFile;
   }
 } else {
   buildConfigFile = './buildjs_config.js';
 }

 require( buildConfigFile );

//Configurate oye.js
amdqueryPath = relativePath + amdqueryPath;

//Configurate project root path
projectRootPath = relativePath + '../../';

//All build files will save to outputPath
outputPath = relativePath + '../output/';

var oye = require('./lib/oye.node.js');

oye.setPath({
  'oyeModulePath': amdqueryPath,
  'projectRootPath': projectRootPath
});
require = oye.require;
define = oye.define;
macthDefineOrRequire = oye.macthDefineOrRequire;


 for ( var i = 2, len = argvs.length, fn; i < len; i++ ) {
   fn = argvsMap[ argvs[ i ] ];
   if ( fn ) {
     fn( argvs[ i ] );
   }
 }


 var logger = buildConfig.debug ? console.info : function( ) {};

 logger( relativePath )