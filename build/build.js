 var buildConfig = {
 	debug: false,
 	amdqueryPath: '../amdquery/',
 	projectRootPath: '../../',
 	distPath: 'dist/',
 	pathVariable: {

 	},
 	apps: {},
 	defines: {},
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
 var _ = require( "underscore" );

 var PATH = require( 'path' );

 var argvs = process.argv;

 var buildFileRootPath = process.argv[ 1 ].replace( /([\\\/])[^\\\/]*$/, '$1' );

 var buildConfigFile = process.argv[ 2 ];
 if ( buildConfigFile && /\.js/.test( buildConfigFile ) ) {
 	if ( !( /^\.*\//.test( buildConfigFile ) ) ) {
 		buildConfigFile = PATH.join( buildFileRootPath, "build_config.js" );
 	}
 	buildConfigFile = require( buildConfigFile );
 	buildConfig = _.extend( buildConfig, buildConfigFile );
 }


 var FSE = require( 'fs-extra' );

 //Configurate oye.js
 amdqueryPath = PATH.join( buildFileRootPath, buildConfig.amdqueryPath );

 //Configurate project root path
 projectRootPath = PATH.join( buildFileRootPath, buildConfig.projectRootPath );

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
 var uglify = require( 'uglify-js' );
 var minify = function( orig_code ) {
 	var options = buildConfig.uglifyOptions;
 	var jsp = uglify.parser;
 	var pro = uglify.uglify;

 	var ast = jsp.parse( orig_code, options.strict_semicolons ); // parse code and get the initial AST
 	ast = pro.ast_mangle( ast, options.mangle_options ); // get a new AST with mangled names
 	ast = pro.ast_squeeze( ast, options.squeeze_options ); // get an AST with compression optimizations
 	var final_code = pro.gen_code( ast, options.gen_options ); // compressed code here
 	return final_code;
 };

 var glob = require( "glob" );
 var async = require( "async" );
 var trumpet = require( "trumpet" );
 var through = require( "through" );
 var concat = require( 'concat-stream' );
 var beautify_html = require( 'js-beautify' ).html;

 var loadedModule = 'loaded' + ( -new Date() );
 var fileStack = {};
 fileStack[ loadedModule ] = {};
 var baseFileStack = [];
 var amdqueryContent = "";
 var AMDQueryJSPath = PATH.join( buildFileRootPath, buildConfig.amdqueryPath, "amdquery.js" );
 var AMDQueryJSRootPath = PATH.join( buildFileRootPath, buildConfig.amdqueryPath );
 var projectDistPath = PATH.join( buildFileRootPath, buildConfig.distPath );

 function readBaseAMDQueryJS( next, result ) {
 	oye.readFile( AMDQueryJSPath, function( content ) {
 		amdqueryContent = content;
 		next( null, content );
 	} );
 }

 function buildDefines( content, next ) {
 	var distPath = PATH.join( projectDistPath, "defines" );
 	if ( !buildConfig.defines ) {
 		return next( null, {}, distPath );
 	}
 	var l = 0,
 		i = 0,
 		key;

 	for ( key in buildConfig.defines ) {
 		l++;
 	}

 	if ( l === 0 ) {
 		next( null, {}, distPath );
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
 				next( null, result, distPath );
 			}
 		};

 	for ( name in buildConfig.defines ) {
 		item = buildConfig.defines[ name ];
 		requireList = checkJSDirectory( item.directory );

 		requireList = requireList.concat( filterDependencies( item.path.replace( ".js", "" ) ) );
 		_buildjs( requireList, name, callback );
 	}

 }

 function saveJSFile( result, dirPath, next ) {

 	var list,
 		i = 0,
 		len,
 		p,
 		readFileCallback = function( err ) {
 			if ( err ) {
 				throw err;
 			}
 		},
 		content,
 		minContent,
 		defineConfig,
 		name,
 		path,
 		deubugPath,
 		minPath;

 	mkdirSync( dirPath );

 	console.log( '\u001b[34m' + '\r\nBegin write file' + '\u001b[39m' );

 	for ( name in result ) {
 		list = result[ name ];
 		defineConfig = buildConfig.defines[ name ];
 		len = list.length;
 		name = name.replace( /^\/+/, '' );
 		path = PATH.join( dirPath, name.replace( /[^\/]*$/, '' ) );
 		deubugPath = PATH.join( dirPath, name + '.debug.js' );
 		minPath = PATH.join( dirPath, name + '.js' );

 		content = list.join( "\r\n" );
 		minContent = minifyContent( content );

 		if ( minContent ) {
 			FSE.writeFile( minPath, minContent, readFileCallback );
 			console.log( '\r\nSave file: ' + minPath );
 		}

 		FSE.writeFile( deubugPath, content, readFileCallback );
 		console.log( '\r\nSave file: ' + deubugPath );

 		if ( defineConfig && typeof defineConfig.complete === "function" ) {
 			defineConfig.complete.call( defineConfig, minPath, minContent, deubugPath, content );
 		}

 	}

 	next( null, null );

 }

 function openHtml( appConfig, createAppDirAndCopyFile ) {
 	console.log( '\u001b[34m' + '\r\nopen HTML and get parameter... \u001b[39m' );
 	var tr = trumpet();
 	var appPath = PATH.join( AMDQueryJSRootPath, appConfig.path );
 	var htmlInfo = {
 		appConfig: {},
 		cssPath: [],
 		htmlPath: appPath,
 		appProjectPath: getFileParentDirectoryPath( appPath ),
 		appName: appConfig.name
 	};

 	tr.selectAll( 'link', function( link ) {
 		link.getAttribute( "href", function( value ) {
 			logger( "css link", value );
 			htmlInfo.cssPath.push( value );
 		} );

 		// link.createReadStream( {outer: true} ).pipe( process.stdout );
 	} );

 	tr.selectAll( 'script[app]', function( script ) {
 		script.getAttribute( "app", function( value ) {
 			// console.log( "app", value );
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
 			logger( "htmlInfo", JSON.stringify( htmlInfo ) );
 			createAppDirAndCopyFile( null, appConfig, htmlInfo );
 		} );
 		// script.createReadStream( {outer: true} ).pipe( process.stdout );
 	} );

 	FSE.createReadStream( appPath ).pipe( tr );
 }

 function createAppDirAndCopyFile( appConfig, htmlInfo, buildAppJS ) {
 	var appDistProjectPath = PATH.join( "apps", htmlInfo.appName ),
 		distPath = PATH.join( projectDistPath, appDistProjectPath );

 	if ( FSE.existsSync( distPath ) ) {
 		console.log( '\u001b[34m' + '\r\nClean "' + htmlInfo.appName + '" directory \u001b[39m' );
 		FSE.removeSync( distPath );
 	}

 	mkdirSync( distPath );

 	var dirNameList = [ "amdquery/ui" ],
 		dirName,
 		len = dirNameList.length,
 		i;

 	for ( i = 0; i < len; i++ ) {
 		dirName = PATH.join( distPath, dirNameList[ i ] );
 		console.log( "make directory: " + "\u001b[34m" + dirName + "\u001b[39m" );
 		mkdirSync( dirName );
 	}

 	logger( htmlInfo.appProjectPath );

 	var copyDirMap = {
 		"app/asset": PATH.join( htmlInfo.appProjectPath, "asset" ),
 		"app/css": PATH.join( htmlInfo.appProjectPath, "css" ),
 		"app/xml": PATH.join( htmlInfo.appProjectPath, "xml" ),
 		"app/lib": PATH.join( htmlInfo.appProjectPath, "lib" ),
 		"amdquery/ui/css": PATH.join( AMDQueryJSRootPath, "ui", "css" ),
 		"amdquery/ui/images": PATH.join( AMDQueryJSRootPath, "ui", "images" )
 	}, key, value;

 	for ( key in copyDirMap ) {
 		value = copyDirMap[ key ];
 		if ( FSE.existsSync( value ) ) {
 			console.log( "copy \u001b[34m" + value + "\u001b[39m to \u001b[34m" + PATH.join( distPath, key ) + "\u001b[39m" );
 			FSE.copySync( value, PATH.join( distPath, key ) );
 		}
 	}

 	htmlInfo.projectDistPath = distPath;

 	buildAppJS( null, appConfig, htmlInfo, PATH.join( projectDistPath, appDistProjectPath, "amdquery" ) );
 }

 function buildAppJS( appConfig, htmlInfo, AMDQueryPath, buildAppXML ) {
 	if ( !htmlInfo.appConfig.src ) {
 		throw htmlInfo.htmlPath + ": 'app' of attribute must define 'src'";
 	}

 	var dirPath = getFileParentDirectoryPath( htmlInfo.appConfig.src );
 	dirPath = dirPath.replace( /\/$/, "" );

 	oye.require.variablePrefix( "@" );
 	oye.require.variable( "app", dirPath );

 	console.log( '\u001b[34m' + '\r\nBuild "' + htmlInfo.appName + '" js file \u001b[39m' );
 	_buildjs( htmlInfo.appConfig.src, htmlInfo.appName, function( name, contentList, moduleList ) {
 		var obj = {};
 		obj.amdquery = contentList;
 		var XMLAndCSSPathList = getXMLAndCSS( htmlInfo, moduleList );
 		saveJSFile( obj, AMDQueryPath, function() {
 			htmlInfo.AMDQueryJSPath = PATH.join( AMDQueryPath, "amdquery" );
 			htmlInfo.AMDQueryJSRelativeHTMLPath = "../amdquery/amdquery";
 			buildAppXML( null, appConfig, htmlInfo, XMLAndCSSPathList );
 		} );
 	} );
 }

 function buildAppXML( appConfig, htmlInfo, XMLAndCSSPathList, buildAppCss ) {
 	console.log( '\u001b[34m' + '\r\nBuild "' + htmlInfo.appName + '" xml file \u001b[39m' );
 	htmlInfo.viewContentID = "aQueryViewContentKey";
 	var content = "<div id='" + htmlInfo.viewContentID + "' >",
 		xmlPathList = XMLAndCSSPathList.xmlPathList,
 		i = 0,
 		xmlItem = null,
 		len = xmlPathList.length;

 	for ( ; i < len; i++ ) {
 		xmlItem = xmlPathList[ i ];
 		content += "\n<div " + htmlInfo.viewContentID + "='" + xmlItem.key + "' >" + FSE.readFileSync( xmlItem.path );
 		content += "\n</div>";
 	}

 	content += "\n</div>"
 	htmlInfo.appCombinationXMLRelativePath = "app/xml/combination.xml";
 	htmlInfo.appCombinationXMLPath = PATH.join( htmlInfo.projectDistPath, htmlInfo.appCombinationXMLRelativePath );

 	console.log( '\r\nSave app Combination xml: ' + htmlInfo.appCombinationXMLPath );

 	FSE.writeFileSync( htmlInfo.appCombinationXMLPath, content );

 	buildAppCss( null, appConfig, htmlInfo, XMLAndCSSPathList );
 }


 function buildAppCss( appConfig, htmlInfo, XMLAndCSSPathList, buildUICss ) {
 	console.log( '\u001b[34m' + '\r\nBuild "' + htmlInfo.appName + '" css file \u001b[39m' );

 	var
 	pathList = htmlInfo.cssPath,
 		resultPath = [],
 		CSSPathList = XMLAndCSSPathList.cssPathList;

 	pathList.forEach( function( item, index ) {
 		var path = "";
 		//绝对路径 项目路径下
 		if ( /^\//.test( item ) ) {
 			path = PATH.join( buildFileRootPath, projectRootPath, item.replace( /^\//, "" ) );
 		} else {
 			path = PATH.join( getFileParentDirectoryPath( htmlInfo.htmlPath ), item );
 		}
 		console.log( "buildAppCss css path:", path );
 		resultPath.push( path );
 	} );

 	CSSPathList.forEach( function( item ) {
 		resultPath.push( item.path );
 	} );

 	htmlInfo.appCombinationCssRelativePath = PATH.join( "css", htmlInfo.appName + ".css" );

 	htmlInfo.appCombinationCssPath = PATH.join( htmlInfo.projectDistPath, "app", htmlInfo.appCombinationCssRelativePath );

 	_buildCssAndSave( resultPath, htmlInfo.appCombinationCssPath );

 	console.log( '\r\nSave app Combination css: ' + htmlInfo.appCombinationCssPath );

 	buildUICss( null, appConfig, htmlInfo );
 }

 function buildUICss( appConfig, htmlInfo, modifyHTML ) {
 	console.log( '\u001b[34m' + '\r\nBuild css of AMDQuery-UI \u001b[39m' );
 	var
 	cwd = PATH.join( AMDQueryJSRootPath, "ui", "css" ),
 		globOpt = {
 			cwd: cwd
 		},
 		cssFileList = glob.sync( "*.css", globOpt );

 	htmlInfo.uiCombinationRelativeCssPath = "amdquery/ui/css/amdquery-widget.css";

 	var uiCombinationCssPath = PATH.join( htmlInfo.projectDistPath, htmlInfo.uiCombinationRelativeCssPath );

 	_buildCssAndSave( cssFileList, uiCombinationCssPath, cwd );

 	console.log( '\r\nSave UI amdquery-widget.css: ', uiCombinationCssPath );

 	modifyHTML( null, appConfig, htmlInfo );
 }

 function modifyHTML( appConfig, htmlInfo ) {
 	var linkTr1 = trumpet(),
 		linkTr2 = trumpet(),
 		scriptTr1 = trumpet(),
 		scriptTr2 = trumpet(),
 		bodyTr = trumpet();


 	htmlInfo.distHtmlPath = PATH.join( htmlInfo.projectDistPath, "app/app.html" );

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
 			append = '<link href="' + htmlInfo.appCombinationCssRelativePath + '" rel="stylesheet" type="text/css" />' + "\n";
 			logger( "add combinationCss", append );
 		}

 		ws.end( append + "\n<!-- annotate by build link.src: " + cssList[ i++ ] + " -->" );
 	} );

 	//必须需要有app这个属性
 	var script1 = scriptTr1.select( "script[app]" );

 	var src = htmlInfo.AMDQueryJSRelativeHTMLPath + ( appConfig.debug ? ".debug" : "" ) + ".js";
 	script1.setAttribute( "src", src );
 	logger( "script setAttribute src", src );

 	script1.getAttribute( "app", function( value ) {
 		var config = splitAttrToObject( value );

 		config.src = "../app/app";
 		logger( "script setAttribute app", "src = " + config.src );
 		config.development = "0";
 		logger( "script setAttribute app", "development = " + config.development );
 		config.debug = !! appConfig.debug;
 		logger( "script setAttribute app", "debug = " + config.debug );
 		config.viewContentID = htmlInfo.viewContentID
 		logger( "script setAttribute app", "viewContentID = " + config.viewContentID );

 		script1.setAttribute( "app", formatToAttr( config ) );
 	} );

 	var script2 = scriptTr2.select( "script[app]" );

 	var scriptStream = script2.createStream( {
 		outer: true
 	} );
 	scriptStream.pipe( through( function( buf ) {
 		this.queue( buf );
 	}, function() {
 		this.queue( '\n<link href="' + "../" + htmlInfo.uiCombinationRelativeCssPath + '" rel="stylesheet" type="text/css" />' );
 	} ) ).pipe( scriptStream );

 	var body = bodyTr.select( "body" );

 	var bodyStream = body.createStream( {
 		outer: true
 	} );

 	bodyStream.pipe( through( function( buf ) {
 		this.queue( buf );
 	}, function() {
 		this.queue( '\n' + FSE.readFileSync( htmlInfo.appCombinationXMLPath ) );
 	} ) ).pipe( bodyStream );

 	var write = FSE.createWriteStream( htmlInfo.distHtmlPath );

 	write.on( 'close', function() {
 		if ( typeof appConfig.complete === "function" ) {
 			FSE.writeFileSync( htmlInfo.distHtmlPath, beautify_html( FSE.readFileSync( htmlInfo.distHtmlPath ).toString(), {} ) );
 			appConfig.complete.call( appConfig, htmlInfo );
 		}
 		console.log( '\u001b[31m\r\nbuilding finish... \u001b[39m' );
 		// buildUICss( null, htmlInfo );
 	} );

 	FSE.createReadStream( htmlInfo.htmlPath ).pipe( linkTr1 ).pipe( linkTr2 ).pipe( scriptTr1 ).pipe( scriptTr2 ).pipe( bodyTr ).pipe( write );
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
 			waterfallNext( null, null );
 			throw err;
 			return;
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
 		content = FSE.readFileSync( PATH.join( buildFileRootPath, buildConfig.amdqueryPath, url + ".js" ) )
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
 			xmlPath = PATH.join( htmlInfo.appProjectPath, "xml", RegExp.$1 + ".xml" );
 			cssPath = PATH.join( htmlInfo.appProjectPath, "css", RegExp.$1 + ".css" );
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

 function _buildCssAndSave( cssPathList, dist, cwd ) {
 	var
 	len = cssPathList.length,
 		i = 0,
 		cssTxt = "";
 	cwd = ( cwd ? cwd : "" );

 	for ( ; i < len; i++ ) {
 		cssTxt += FSE.readFileSync( PATH.join( cwd, cssPathList[ i ] ) );
 	}

 	var CleanCSS = require( 'clean-css' );
 	var minimized = new CleanCSS( buildConfig.cleanCssOptions )
 		.minify( cssTxt );

 	FSE.writeFileSync( dist, minimized.toString() );

 	return dist;
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
 	// logger( content );
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
 			cwd: PATH.join( AMDQueryJSRootPath, directory )
 		};
 		resultDirectory = resultDirectory.concat( glob.sync( suffix, globOpt ) );
 		for ( j = 0, m = resultDirectory.length; j < m; j++ ) {
 			content = FSE.readFileSync( PATH.join( globOpt.cwd, resultDirectory[ j ] ) );
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