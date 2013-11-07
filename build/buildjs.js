 //需要安装 minimatch
 var buildConfig = {
   debug: false,
   amdqueryPath: '../amdquery/',
   projectRootPath: '../../',
   outputPath: '../output/',
   apps: {},
   levelOfJSMin: 3,
   uglifyOptions: {
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
   }
 };

 var argvs = process.argv;

 var argvsMap = {
   "-d": function( ) {
     buildConfig.debug = true;
   }
 };

 var relativePath = process.argv[ 1 ].replace( /([\\\/])[^\\\/]*$/, '$1' );

 var buildConfigFile = process.argv[ 2 ];
 if ( buildConfigFile && /\.js/.test( buildConfigFile ) ) {
   if ( !( /^\.*\//.test( buildConfigFile ) ) ) {
     buildConfigFile = './' + buildConfigFile;
   }
   buildConfigFile = require( buildConfigFile );
   for ( var i in buildConfigFile ) {
     buildConfig[ i ] = buildConfigFile[ i ];
   }
 }



 var FSO = require( 'fs' );
 var PATH = require( 'path' );

 //Configurate oye.js
 amdqueryPath = buildConfig.amdqueryPath;

 //Configurate project root path
 projectRootPath = buildConfig.projectRootPath;

 //All build files will save to outputPath
 outputPath = relativePath + '../output/';

 var oye = require( './lib/oye.node.js' );

 oye.setPath( {
   'oyeModulePath': amdqueryPath,
   'projectRootPath': projectRootPath
 } );
 amdRequire = oye.require;
 amdDefine = oye.define;
 macthDefineOrRequire = oye.macthDefineOrRequire;


 for ( var i = 2, len = argvs.length, fn; i < len; i++ ) {
   fn = argvsMap[ argvs[ i ] ];
   if ( fn ) {
     fn( argvs[ i ] );
   }
 }

 var logger = buildConfig.debug ? console.info : function( ) {};

 logger( relativePath );

 //Uglify
 var uglify = require( './lib/uglify/uglify-js.js' );
 var minify = function( content ) {
   return uglify( content, uglifyOptions );
 };

 var glob = require( "glob" );
 var async = require( "./lib/async.js" );

 var loadedModule = 'loaded' + ( -new Date( ) );
 var fileStack = {};
 fileStack[ loadedModule ] = {};
 var baseFileStack = [ ];

 function readBaseAMDQueryJS( next, result ) {
   oye.readFile( buildConfig.amdqueryPath + "amdquery.js", function( content ) {
     setBaseFileStack( content, "amdquery.js" );
     next( null, content );
   } );
 }

 function buildApps( result, next ) {

   if ( !buildConfig.apps ) {
     return next( "apps is empty", null );
   }
   var l = 0,
     key;
   for ( key in buildConfig.apps ) {
     l++;

   }
   if ( l === 0 ) {
     next( "apps is empty", null );
   }
   //Process all apps
   var n = l,
     appName,
     callback = function( ) {
       n--;

       if ( n <= 0 ) {
         next( null, null );
       }
     };

   for ( appName in buildConfig.apps ) {
     _build( buildConfig.apps[ appName ], appName, callback );
   }

 }

 function main( ) {
   async.waterfall( [ readBaseAMDQueryJS, buildApps ], function( err, result ) {
     if ( err ) {
       throw err;
     }
     switch ( result ) {

     }
   } );
 }

 var _build = function( sModule, appName, callback ) {
   oye.require( sModule, function( Module ) { //Asynchronous
     var list = Module.getDependenciesMap( );
     var l = list.length;
     console.info( '\u001b[34m' + '\r\nDependencies length of module ' + sModule + ': ' + l + '\u001b[39m' );
     var item, moduleName, n = l,
       fn = function( ) {
         n--;
         if ( n === 0 ) {
           if ( callback )
             callback( );
         }
       }
       console.log(list)
     for ( var i = 0; i < l; i++ ) {
       item = list[ i ];
       moduleName = item.name;
       console.log( moduleName, item.path, oye.require.content[moduleName], appName );
       // processFile( moduleName, module.path, appName, fn );
     }
   } );
 };

 function processFile( module, path, target, callbak ) {
   FSO.readFile( path, function( err, data ) {
     if ( err ) {
       throw err;
     }
     var content = data.toString( );

     setFileStack( content, module, target );

     if ( callback ) {
       callback( content );
     }
   } );
 }

 function editDefine( content, module ) {
   content = "/*===================" + module + "===========================*/\n" + content;
   var r = /define\s*\(\s*(['"])[^\1]*\1/i;
   if ( !r.test( content ) ) {
     content = content.replace( /define\(/, 'define("' + module + '",' );
   }
   content += "\n/*=======================================================*/\n";
   logger( content );
   return content;
 }

 function setBaseFileStack( content, module ) {
   content = editDefine( content, module );
   baseFileStack.unshift( content );
 }

 function setFileStack( content, module, target ) {
   content = editDefine( content, module );
   if ( !fileStack[ target ] ) {
     fileStack[ target ] = {
       modules: [ ],
       content: [ ]
     };
   }
   if ( !fileStack[ loadedModule ][ module ] ) {
     fileStack[ loadedModule ][ module ] = true;
     fileStack[ target ].modules.unshift( module );
     fileStack[ target ].content.unshift( content );
   }
 }

 function mkdirSync( path ) {
   if ( !path || PATH.existsSync( path ) ) {
     return;
   }
   var r = /(?=[\\\/]+)/;
   var list = path.split( r );
   var l = list.length;
   var _path;
   for ( var i = 1; i < l; i++ ) {
     _path = list.slice( 0, i ).join( '' );
     if ( PATH.existsSync( _path ) ) {
       continue;
     }
     FSO.mkdirSync( _path );
   }
 }

 function forEach( obj, callback, context ) {
   if ( !obj ) return this;
   var i = 0,
     item, len = obj.length,
     isObj = typeof len != "number" || typeof obj == "function";
   if ( isObj ) {
     for ( item in obj )
       if ( callback.call( context || obj[ item ], obj[ item ], item ) === false ) break;
   } else
     for ( var value = obj[ 0 ]; i < len && callback.call( context || value, value, i ) !== false; value = obj[ ++i ] ) {}
   return this;
 }


 main( );