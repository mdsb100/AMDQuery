 var buildConfig = {
   debug: false,
   amdqueryPath: '../amdquery/',
   projectRootPath: '../../',
   outputPath: 'output/',
   pathVariable: {

   },
   apps: {},
   defines: {},
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
   },
   cleanCssOptions: {
     keepSpecialComments: "*",
     keepBreaks: false,
     processImport: true,
     noRebase: false,
     noAdvanced: false,
     selectorsMergeMode: "*"
   }
 };

 var argvs = process.argv;

 var buildFileRootPath = process.argv[ 1 ].replace( /([\\\/])[^\\\/]*$/, '$1' );

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



 var FSE = require( 'fs-extra' );
 var PATH = require( 'path' );

 //Configurate oye.js
 amdqueryPath = buildConfig.amdqueryPath;

 //Configurate project root path
 projectRootPath = buildConfig.projectRootPath;

 var oye = require( './lib/oye.node.js' );

 oye.setPath( {
   'oyeModulePath': amdqueryPath,
   'projectRootPath': projectRootPath
 } );
 amdRequire = oye.require;
 amdDefine = oye.define;

 var logger = buildConfig.debug ? console.info : function() {};

 logger( buildFileRootPath );

 //Uglify
 var uglify = require( './lib/uglify/uglify-js.js' );
 var minify = function( content ) {
   return uglify( content, buildConfig.uglifyOptions );
 };

 var glob = require( "glob" );
 var async = require( "async" );
 var trumpet = require( "trumpet" );
 var through = require( "through" );
 var concat = require( 'concat-stream' );
 var _ = require( "underscore" );

 var loadedModule = 'loaded' + ( -new Date() );
 var fileStack = {};
 fileStack[ loadedModule ] = {};
 var baseFileStack = [];
 var amdqueryContent = "";
 var AMDQueryJSPath = buildConfig.amdqueryPath + "amdquery.js";
 var AMDQueryJSRootPath = buildFileRootPath + buildConfig.amdqueryPath;

 function readBaseAMDQueryJS( next, result ) {
   oye.readFile( AMDQueryJSPath, function( content ) {
     amdqueryContent = content;
     next( null, content );
   } );
 }

 function buildDefines( content, next ) {

   if ( !buildConfig.defines ) {
     return next( null, {}, "defines/" );
   }
   var l = 0,
     i = 0,
     key;

   for ( key in buildConfig.defines ) {
     l++;
   }

   if ( l === 0 ) {
     next( null, {}, "defines/" );
   }
   //Process all defines
   var n = l,
     name,
     item,
     requireList,
     result = {

     },
     callback = function( name, list ) {
       n--;
       result[ name ] = list;

       if ( n <= 0 ) {
         next( null, result, "defines/" );
       }
     };

   for ( name in buildConfig.defines ) {
     item = buildConfig.defines[ name ];
     requireList = checkJSDirectory( item.directory );

     requireList = requireList.concat( filterDependencies( item.path ) );
     _buildjs( requireList, name, callback );
   }

 }

 function saveJSFile( result, dirPath, next ) {
   dirPath = buildConfig.outputPath + dirPath;
   var list,
     i = 0,
     len,
     p,
     readFileCallback = function( err ) {
       if ( err ) {
         throw err;
       }
     },
     allFile,
     minFile,
     content,
     minContent,
     name;

   mkdirSync( dirPath );

   console.log( '\u001b[34m' + '\r\nBegin write file' + '\u001b[39m' );

   for ( name in result ) {
     list = result[ name ];
     len = list.length;
     name = name.replace( /^\/+/, '' );
     path = dirPath + name.replace( /[^\/]*$/, '' );
     allPath = dirPath + name + '.all.js';
     minPath = dirPath + name + '.js';

     content = list.join( "\r\n" );
     minContent = minifyContent( content );

     if ( minContent ) {
       FSE.writeFile( minPath, minContent, readFileCallback );
       console.log( '\r\nSave file: ' + minPath );
     }

     FSE.writeFile( allPath, content, readFileCallback );
     console.log( '\r\nSave file: ' + allPath );


   }

   next( null, null );

 }

 function openHtml( appConfig, createAppDirAndCopyFile ) {
   var tr = trumpet();
   var htmlInfo = {
     appConfig: {},
     cssPath: [],
     htmlPath: AMDQueryJSRootPath + appConfig.path,
     appProjectPath: getFileParentDirectoryPath( AMDQueryJSRootPath + appConfig.path ),
     appName: appConfig.name
   };

   tr.selectAll( 'link', function( link ) {
     link.getAttribute( "href", function( value ) {
       htmlInfo.cssPath.push( value );
     } );

     // link.createReadStream( {outer: true} ).pipe( process.stdout );
   } );

   tr.selectAll( 'script[app]', function( script ) {
     script.getAttribute( "app", function( value ) {
       console.log( "app", value );
       var list = value.split( /;|,/ ),
         item, i, attr;

       for ( i = list.length - 1; i >= 0; i-- ) {
         item = list[ i ];
         if ( item ) {
           attr = item.split( /=|:/ );
           if ( attr[ 1 ] ) {
             htmlInfo.appConfig[ attr[ 0 ] ] = attr[ 1 ];
           }
         }
       }
       logger( JSON.stringify( htmlInfo ) );
       createAppDirAndCopyFile( null, htmlInfo, appConfig );
     } );
     // script.createReadStream( {outer: true} ).pipe( process.stdout );
   } );

   FSE.createReadStream( AMDQueryJSRootPath + appConfig.path ).pipe( tr );
 }

 function createAppDirAndCopyFile( htmlInfo, appConfig, buildAppJS ) {
   var appOutputProjectPath = "apps/" + htmlInfo.appName + "/",
     outputPath = buildConfig.outputPath + appOutputProjectPath;

   if ( FSE.existsSync( outputPath ) ) {
     console.log( '\u001b[34m' + '\r\nClean app ' + htmlInfo.appName + ' directory \u001b[39m' );
     FSE.removeSync( outputPath );
   }

   mkdirSync( outputPath );

   var dirNameList = [ "amdquery/ui/" ],
     len = dirNameList.length,
     i;

   for ( i = 0; i < len; i++ ) {
     console.log( "make directory: " + "\u001b[34m" + dirNameList[ i ] + "\u001b[39m" );
     mkdirSync( outputPath + dirNameList[ i ] );
   }

   logger( htmlInfo.appProjectPath );

   var copyDirMap = {
     "app/asset/": htmlInfo.appProjectPath + "asset/",
     "app/css/": htmlInfo.appProjectPath + "css/",
     "app/xml/": htmlInfo.appProjectPath + "xml/",
     "amdquery/ui/css/": AMDQueryJSRootPath + "ui/css/",
     "amdquery/ui/images/": AMDQueryJSRootPath + "ui/images/"
   }, key, value;

   for ( key in copyDirMap ) {
     value = copyDirMap[ key ];
     console.log( "copy \u001b[34m" + value + "\u001b[39m to \u001b[34m" + outputPath + key + "\u001b[39m" );
     FSE.copySync( value, outputPath + key );
   }

   htmlInfo.projectOutputPath = outputPath;

   buildAppJS( null, htmlInfo, appOutputProjectPath + "amdquery/" );
 }

 function buildAppJS( htmlInfo, AMDQueryPath, buildAppXML ) {
   if ( !htmlInfo.appConfig.src ) {
     throw htmlInfo.htmlPath + ": 'app' of attribute must define 'src'";
   }

   var dirPath = getFileParentDirectoryPath( htmlInfo.appConfig.src );
   dirPath = dirPath.replace( /\/$/, "" );

   oye.require.variablePrefix( "@" );
   oye.require.variable( "app", dirPath );

   console.log( '\u001b[34m' + '\r\nBuild app ' + htmlInfo.appName + ' js file \u001b[39m' );
   _buildjs( htmlInfo.appConfig.src, htmlInfo.appName, function( name, contentList, moduleList ) {
     var obj = {};
     obj.amdquery = contentList;
     var XMLAndCSSPathList = getXMLAndCSS( htmlInfo, moduleList );
     saveJSFile( obj, AMDQueryPath, function() {
       htmlInfo.AMDQueryJSPath = AMDQueryPath + "amdquery";
       htmlInfo.AMDQueryJSRelativeHTMLPath = "../amdquery/amdquery";
       buildAppXML( null, htmlInfo, XMLAndCSSPathList );
     } );
   } );
 }

 function buildAppXML( htmlInfo, XMLAndCSSPathList, buildAppCss ) {
   console.log( '\u001b[34m' + '\r\nBuild xml ' + htmlInfo.appName + ' css file \u001b[39m' );
   var content = "<root>",
     xmlPathList = XMLAndCSSPathList.xmlPathList,
     i = 0,
     xmlItem = null,
     len = xmlPathList.length;

   for ( ; i < len; i++ ) {
     xmlItem = xmlPathList[ i ];
     content += "<wrap key='" + xmlItem.key + "' >" + FSE.readFileSync( xmlItem.path );
     content += "</wrap>";
   }

   content += "</root>"

   htmlInfo.appCombinationXMLRelativePath = "xml/" + "combination.xml";

   htmlInfo.appCombinationXMLPath = htmlInfo.projectOutputPath + "app/" + htmlInfo.appCombinationXMLRelativePath;

   console.log( '\r\nSave app Combination xml: ' + htmlInfo.appCombinationXMLPath );

   FSE.writeFileSync( htmlInfo.appCombinationXMLPath, content );

   buildAppCss( null, htmlInfo, XMLAndCSSPathList );
 }


 function buildAppCss( htmlInfo, XMLAndCSSPathList, buildUICss ) {
   console.log( '\u001b[34m' + '\r\nBuild app ' + htmlInfo.appName + ' css file \u001b[39m' );

   var
   pathList = htmlInfo.cssPath,
     resultPath = [],
     CSSPathList = XMLAndCSSPathList.cssPathList;

   pathList.forEach( function( item, index ) {
     var path = "";
     //绝对路径 项目路径下
     if ( /^\//.test( item ) ) {
       path = buildFileRootPath + projectRootPath + item.replace( /^\//, "" );
     } else {
       path = getFileParentDirectoryPath( htmlInfo.htmlPath ) + item;
     }
     console.log( "buildAppCss css path:", path );
     resultPath.push( path );
   } );

   CSSPathList.forEach( function( item ) {
     resultPath.push( item.path );
   } );

   htmlInfo.appCombinationCssRelativePath = "css/" + htmlInfo.appName + ".css";

   htmlInfo.appCombinationCssPath = htmlInfo.projectOutputPath + "app/" + htmlInfo.appCombinationCssRelativePath;

   _buildCssAndSave( resultPath, htmlInfo.appCombinationCssPath );

   console.log( '\r\nSave app Combination css: ' + htmlInfo.appCombinationCssPath );

   buildUICss( null, htmlInfo );
 }

 function buildUICss( htmlInfo, modifyHTML ) {
   console.log( '\u001b[34m' + '\r\nBuild css of AMDQuery-UI \u001b[39m' );
   var
   cwd = AMDQueryJSRootPath + "ui/css/",
     globOpt = {
       cwd: cwd
     },
     cssFileList = glob.sync( "*.css", globOpt );

   htmlInfo.uiCombinationCssPath = htmlInfo.projectOutputPath + "amdquery/ui/css/amdquery-widget.css";

   _buildCssAndSave( cssFileList, htmlInfo.uiCombinationCssPath, cwd );

   console.log( '\r\nSave UI amdquery-widget.css: ' + htmlInfo.uiCombinationCssPath );

   modifyHTML( null, htmlInfo );
 }

 function modifyHTML( htmlInfo ) {
   var linkTr1 = trumpet(),
     linkTr2 = trumpet(),
     scriptTr3 = trumpet(),
     s = through();

   htmlInfo.outputHtmlPath = htmlInfo.projectOutputPath + "app/app.html";

   var cssList = [],
     first = false,
     append = "",
     i = 0;

   linkTr1.selectAll( "link", function( link ) {
     link.getAttribute( "href", function( value ) {
       cssList.push( value );
     } );
   } );

   linkTr2.selectAll( "link", function( link ) {
     var ws = link.createWriteStream( {
       outer: true
     } );
     append = "";
     if ( !first ) {
       first = true;
       append = '<link href="' + htmlInfo.appCombinationCssRelativePath + '" rel="stylesheet" type="text/css" />';
       logger( "add combinationCss", append );
     }

     ws.end( append + "\n<!-- annotate by build link.src: " + cssList[ i++ ] + " -->" );
   } );

   //必须需要有app这个属性
   var script = scriptTr3.select( "script[app]" );
   var src = htmlInfo.AMDQueryJSRelativeHTMLPath + ".js";
   script.setAttribute( "src", src );
   logger( "script setAttribute src", src );

   script.getAttribute( "app", function( value ) {
     var config = splitAttrToObject( value );

     config.src = "../app/app";
     logger( "script setAttribute app", "src = " + config.src );
     config.development = "0";
     logger( "script setAttribute app", "development = " + config.development );
     script.setAttribute( "app", formatToAttr( config ) );
   } );

   var write = FSE.createWriteStream( htmlInfo.outputHtmlPath );

   write.on( 'close', function() {
     console.log( "close" );
     // buildUICss( null, htmlInfo );
   } );

   FSE.createReadStream( htmlInfo.htmlPath ).pipe( linkTr1 ).pipe( linkTr2 ).pipe( scriptTr3 ).pipe( write );
 }

 function main() {
   async.waterfall( [
     startBuildDefines,
     startBuildApps
   ], function( err, result ) {
     if ( err ) {
       throw err;
     }
     console.log( '\u001b[34m' + '\r\nBuiding finish' + '\u001b[39m' );
   } );
 }

 function getFileParentDirectoryPath( path ) {
   return path.replace( /([\\\/])[^\\\/]*$/, '$1' );
 }

 function startBuildDefines( waterfallNext ) {
   console.log( '\u001b[31m\r\nstart building defines... \u001b[39m' );

   setPathVariable( buildConfig.pathVariable );

   // build defines
   async.waterfall( [
     readBaseAMDQueryJS,
     buildDefines,
     saveJSFile
   ], function( err, result ) {
     if ( err ) {
       throw err;
     }
     switch ( result ) {

     }
     waterfallNext( null, null );
   } );
 }

 var apps = buildConfig.apps.concat();

 function startBuildApps( result, waterfallNext ) {
   if ( apps.length ) {
     var appConfig = apps.shift();

     console.log( '\u001b[31m\r\nstart building app ' + appConfig.name + ' ... \u001b[39m' );

     async.waterfall( [

       function( callback ) {
         callback( null, appConfig );
       },
       openHtml,
       createAppDirAndCopyFile,
       buildAppJS,
       buildAppXML,
       buildAppCss,
       buildUICss,
       modifyHTML
     ], function( err, result ) {
       if ( err ) {
         throw err;
       }
       startBuildApps( null, waterfallNext );
     } );

   } else {
     waterfallNext( null, null );
   }
 }

 function setPathVariable( obj ) {
   for ( var name in obj ) {
     oye.require.variable( name, obj[ name ] );
   }
 }

 function filterDependencies( url ) {
   var result = [],
     content = FSE.readFileSync( buildConfig.amdqueryPath + url + ".js" )
       .toString(),
     moduleList = oye.matchDefine( content ),
     moduleInfo,
     i = 0,
     len = moduleList.length;

   for ( ; i < len; i++ ) {
     moduleInfo = moduleList[ i ];

     if ( moduleInfo.name === "require" && moduleInfo.module ) {
       result.push( moduleInfo.module );
     }
     if ( moduleInfo.depends ) {
       result = result.concat( eval( moduleInfo.depends ) );
     }

   }

   return result;
 }


 function getXMLAndCSS( htmlInfo, moduleList ) {
   var i = 0,
     len = moduleList.length,
     mdItem, xmlPath, xmlPathList = [],
     cssPath, cssPathList = [];
   for ( ; i < len; i++ ) {
     mdItem = moduleList[ i ];

     if ( /app\/view\/(.*)/.test( mdItem.name ) ) {
       xmlPath = htmlInfo.appProjectPath + "xml/" + RegExp.$1 + ".xml";
       cssPath = htmlInfo.appProjectPath + "css/" + RegExp.$1 + ".css";
       if ( FSE.existsSync( xmlPath ) ) {
         xmlPathList.push( {
           key: RegExp.$1,
           path: xmlPath
         } );
       }
       if ( FSE.existsSync( cssPath ) ) {
         cssPathList.push( {
           key: RegExp.$1,
           path: cssPath
         } );
       }
     }
   }

   return {
     xmlPathList: xmlPathList,
     cssPathList: cssPathList
   }
 }

 function _buildjs( modules, name, callback ) {
   oye.require( modules, function( Module ) { //Asynchronous
     var
     args = arguments,
       len = args.length,
       i = 0,
       module,
       dependencies,
       list = [];

     for ( ; i < len; i++ ) {
       module = args[ i ];
       dependencies = module.getDependenciesList();
       list = list.concat( dependencies );
       console.info( '\u001b[34m' + '\r\nDependencies length of module ' + module._amdID + ': ' + dependencies.length + '\u001b[39m' );
     }

     // list.sort( function( a, b ) {
     //   return a.index - b.index;
     // } );
     var l = list.length;

     var item,
       moduleName, result = [],
       pathMap = {};

     pathMap[ AMDQueryJSPath ] = true;

     result.push( editDefine( amdqueryContent, "amdquery" ) );

     for ( i = 0; i < l; i++ ) {
       item = list[ i ];

       if ( !pathMap[ item.path ] ) {
         result.push( editDefine( item.content, item.name ) );
         pathMap[ item.path ] = true;
       }
     }

     console.info( '\u001b[33m' + '\r\nthe defines "' + name + '" Dependencies length of file ' + result.length + '\u001b[39m' );

     callback( name, result, list );
   } );
 }

 function _buildCssAndSave( cssPathList, output, cwd ) {
   var
   len = cssPathList.length,
     i = 0,
     cssTxt = "";
   cwd = ( cwd ? cwd : "" );

   for ( ; i < len; i++ ) {
     cssTxt += FSE.readFileSync( cwd + cssPathList[ i ] );
   }

   var CleanCSS = require( 'clean-css' );
   var minimized = new CleanCSS( buildConfig.cleanCssOptions )
     .minify( cssTxt );

   FSE.writeFileSync( output, minimized.toString() );

   return output;
 }

 function splitAttrToObject( str ) {
   var result = {}, j = 0,
     attrs = str.split( /;|,/ ),
     attr;
   for ( ; attr = attrs[ j++ ]; ) {
     attr = attr.split( /:|=/ );
     if ( attr[ 1 ] ) {
       // attr[ 1 ].match( /false|true|1|0/ ) && ( attr[ 1 ] = eval( attr[ 1 ] ) );
       result[ attr[ 0 ] ] = attr[ 1 ];
     }
   }
   return result;
 }

 function formatToAttr( object ) {
   var result = "",
     key, value;
   for ( key in object ) {
     value = object[ key ];
     result += key + ":" + value + ";";
   }

   return result;
 }

 function minifyContent( content ) {
   try {
     var minContent = minify( content );
     return minContent;
   } catch ( e ) {
     var line = e.line,
       start = ( line > 10 ? line - 10 : 0 ),
       end = line + 10;
     //var line = e.line, start = 0, end = undefined;
     console.log( '\u001b[31m' + e.message + ' Line: ' + line + '\u001b[0m' );
     content = content.split( /(?:\r\n|[\r\n])/ )
       .slice( start, end );
     var errCode = [],
       lineNumber, code;
     for ( var i = 0; i < content.length; i++ ) {
       lineNumber = i + start + 1;
       code = ( lineNumber === line ) ? ( '\u001b[31m' + lineNumber + ' ' + content[ i ] + '\u001b[0m' ) : ( '\u001b[36m' + lineNumber + ' \u001b[32m' + content[ i ] + '\u001b[0m' );
       errCode.push( code );
     }
     console.log( errCode.join( '\r\n' ) );
     return null;
   }
 }

 function editDefine( content, module ) {
   content = "/*===================" + module + "===========================*/\r\n" + content;
   var r = /define\s*\(\s*(['"])[^\1]*\1/i;
   if ( !r.test( content ) ) {
     content = content.replace( /define\(/, 'define("' + module + '",' );
   }
   content += "\r\n\r\n/*=======================================================*/\r\n";
   logger( content );
   return content;
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
     _path = list.slice( 0, i )
       .join( '' );
     if ( PATH.existsSync( _path ) ) {
       continue;
     }
     FSE.mkdirSync( _path );
   }
 }

 function checkJSDirectory( directoryList, suffix ) {
   suffix = suffix || "*.js";
   var result = [],
     i = 0,
     j = 0,
     k = 0,
     l = directoryList ? directoryList.length : 0,
     m,
     n,
     globOpt,
     resultDirectory = [],
     directory,
     moduleAndDepends,
     content;
   for ( i = 0; i < l; i++ ) {
     directory = directoryList[ i ];
     globOpt = {
       cwd: AMDQueryJSRootPath + directory
     };
     resultDirectory = resultDirectory.concat( glob.sync( suffix, globOpt ) );
     for ( j = 0, m = resultDirectory.length; j < m; j++ ) {
       content = FSE.readFileSync( AMDQueryJSRootPath + directory + resultDirectory[ j ] );
       moduleAndDepends = oye.matchDefine( content.toString() );
       for ( k = 0, n = moduleAndDepends.length; k < n; k++ ) {
         if ( moduleAndDepends[ k ].module ) {
           result.push( moduleAndDepends[ k ].module );
         }

       }
     }
   }

   return result;
 }

 main();