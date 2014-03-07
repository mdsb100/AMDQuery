 var buildConfig = {
 	debug: false,
 	amdqueryPath: '../amdquery/',
 	projectRootPath: '../', // server root
 	distPath: 'dist/',
 	pathVariable: {

 	},
 	apps: [],
 	cleanCssOptions: {
 		keepSpecialComments: "*",
 		keepBreaks: false,
 		processImport: true,
 		noRebase: false,
 		noAdvanced: false,
 		selectorsMergeMode: "*"
 	},
 	uglifyOptions: {}
 };
 var _ = require( "underscore" );

 var PATH = require( 'path' );

 var argvs = process.argv;

 var buildFileRootPath = PATH.dirname( process.argv[ 1 ] );

 var buildConfigFile = process.argv[ 2 ];

 if ( !buildConfigFile || !/\.js/.test( buildConfigFile ) ) {
 	buildConfigFile = "build_app_config.js";
 }
 if ( !( /^\.*\//.test( buildConfigFile ) ) ) {
 	buildConfigFile = PATH.join( buildFileRootPath, buildConfigFile );
 }
 buildConfigFile = require( buildConfigFile );
 buildConfig = _.extend( buildConfig, buildConfigFile );


 var FSE = require( 'fs-extra' );

 var amdqueryProjectPath = PATH.join( buildFileRootPath, ".." );

 var amdqueryPath = PATH.join( buildFileRootPath, buildConfig.amdqueryPath );

 //Configurate project root path
 var projectRootPath = PATH.join( buildFileRootPath, buildConfig.projectRootPath );

 var util = require( './lib/util.js' );

 var oye = require( './lib/oye.node.js' );

 var logger = buildConfig.debug ? console.info : function() {};

 logger( buildFileRootPath );

 var colors = require( "colors" );
 var glob = require( "glob" );
 var async = require( "async" );
 var trumpet = require( "trumpet" );
 var through = require( "through" );
 var concat = require( 'concat-stream' );
 var beautify_html = require( "js-beautify" ).html;
 var htmlparser = require( "htmlparser" )

 var amdqueryContent = "";
 var AMDQueryJSPath = PATH.join( buildFileRootPath, buildConfig.amdqueryPath, "amdquery.js" );
 var AMDQueryJSRootPath = PATH.join( buildFileRootPath, buildConfig.amdqueryPath );
 var projectDistPath = PATH.join( buildFileRootPath, buildConfig.distPath );

 var DebugJSSuffix = "-debug.js";

 function getAppaQueryConfig( appConfig, openHtml ) {
 	var htmlPath = PATH.join( AMDQueryJSRootPath, appConfig.path );
 	var raQueryConfig = /aQueryConfig\s*=/;
 	var appProjectPath = PATH.dirname( htmlPath );
 	var htmlInfo = {
 		appConfig: {},
 		cssPath: [],
 		UICssPath: [],
 		htmlPath: htmlPath,
 		appProjectPath: appProjectPath,
 		appDirectoryName: PATH.basename( appProjectPath ),
 		AMDQueryProjectPath: amdqueryProjectPath,
 		appName: appConfig.name
 	};
 	var aQueryConfigStr = null;
 	var doNext = function( aQueryConfigStr ) {
 		try {
 			eval( aQueryConfigStr );
 			if ( aQueryConfig.app ) {
 				_.extend( htmlInfo.appConfig, aQueryConfig.app );
 				openHtml( null, appConfig, htmlInfo );
 			} else {
 				openHtml( "getAppaQueryConfig: Find aQueryConfig but aQueryConfig.app is not defined." );
 			}

 		} catch ( e ) {
 			openHtml( "getAppaQueryConfig: Find aQueryConfig but eval it fail." );
 		}
 	};

 	if ( appConfig.aQueryConfig == true ) {
 		var tr = trumpet();
 		var scriptAll = tr.selectAll( "head script", function( script ) {
 			var scriptStream = script.createStream();
 			var scriptStr = "";
 			scriptStream.pipe( through( function( buf ) {
 				scriptStr += buf.toString();
 			}, function() {
 				if ( raQueryConfig.test( scriptStr ) ) {
 					aQueryConfigStr = scriptStr;
 				}
 			} ) ).pipe( scriptStream );
 		} );

 		FSE.createReadStream( htmlPath ).pipe( tr ).on( "close", function() {
 			if ( aQueryConfigStr ) {
 				doNext( aQueryConfigStr );
 			} else {
 				openHtml( "getAppaQueryConfig: You set 'appConfig.aQueryConfig' true, but can not find aQueryConfig in head of HTML." );
 			}
 		} );
 	} else if ( typeof appConfig.aQueryConfig == "string" ) {
 		var aQueryConfigPath = PATH.join( PATH.dirname( htmlPath ), appConfig.aQueryConfig );
 		if ( PATH.existsSync( aQueryConfigPath ) ) {
 			aQueryConfigStr = FSE.readFileSync( aQueryConfigPath ).toString();
 			doNext( aQueryConfigStr );
 		} else {
 			openHtml( "getAppaQueryConfig: You set 'appConfig.aQueryConfig' a string, but can not find file of aQueryConfig." )
 		}
 	} else {
 		openHtml( null, appConfig, htmlInfo );
 	}

 }

 function openHtml( appConfig, htmlInfo, createAppDirAndCopyFile ) {
 	console.log( '\r\nOpen HTML and get parameter... '.red );
 	var tr = trumpet();

 	tr.selectAll( 'link[type="text/css"]', function( link ) {
 		link.getAttribute( "href", function( value ) {
 			// ignore ui css
 			if ( value.indexOf( "amdquery/ui/css" ) == -1 ) {
 				logger( "[DEBUG]".white, "css link".white, value.white );
 				htmlInfo.cssPath.push( value );
 			} else {
 				logger( "[DEBUG]".white, "UI css link".white, value.white );
 				htmlInfo.UICssPath.push( PATH.basename( value ) );
 			}
 		} );
 	} );

 	logger( "[DEBUG]".white, "selectAll script[app]".white );
 	tr.selectAll( 'script[app]', function( script ) {
 		script.getAttribute( "app", function( value ) {
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
 			logger( "[DEBUG]".white, "htmlInfo".white, JSON.stringify( htmlInfo ).white );

 		} );
 	} );


 	FSE.createReadStream( htmlInfo.htmlPath ).pipe( tr ).on( 'close', function() {
 		createAppDirAndCopyFile( null, appConfig, htmlInfo );
 	} );
 }

 function createAppDirAndCopyFile( appConfig, htmlInfo, buildLibJSFromHead ) {
 	var appDistProjectPath = PATH.join( "apps", htmlInfo.appName ),
 		distPath = PATH.join( projectDistPath, appDistProjectPath );

 	if ( FSE.existsSync( distPath ) ) {
 		console.log( '\r\nClean "' + htmlInfo.appName + '" directory ' );
 		FSE.removeSync( distPath );
 	}

 	util.mkdirSync( distPath );

 	var dirNameList = [
  "amdquery/ui",
  htmlInfo.appDirectoryName + "/assets",
  htmlInfo.appDirectoryName + "/styles"
  ],
 		dirName,
 		len = dirNameList.length,
 		i;

 	for ( i = 0; i < len; i++ ) {
 		dirName = PATH.join( distPath, dirNameList[ i ] );
 		console.log( "make directory: " + dirName.red );
 		util.mkdirSync( dirName );
 	}

 	var globalPath = PATH.join( htmlInfo.AMDQueryProjectPath, "global" ),
 		globalDirectoryName = globalPath.replace( projectRootPath, "" ),
 		globalDistPath = PATH.join( distPath, globalDirectoryName );

 	logger( "[DEBUG]".white, "copy directory:".white, globalPath, "to", globalDistPath );

 	util.mkdirSync( globalDistPath );
 	FSE.copySync( globalPath, globalDistPath );

 	logger( "[DEBUG]".white, "app project path:".white, htmlInfo.appProjectPath.white );

 	var copyDirMap = {
 		"amdquery/ui/css": PATH.join( AMDQueryJSRootPath, "ui", "css" ),
 		"amdquery/ui/images": PATH.join( AMDQueryJSRootPath, "ui", "images" )
 	}, key, value;

 	copyDirMap[ htmlInfo.appDirectoryName + "/assets" ] = PATH.join( htmlInfo.appProjectPath, "assets" );
 	copyDirMap[ htmlInfo.appDirectoryName + "/styles" ] = PATH.join( htmlInfo.appProjectPath, "styles" );
 	copyDirMap[ htmlInfo.appDirectoryName + "/xml" ] = PATH.join( htmlInfo.appProjectPath, "xml" );
 	copyDirMap[ htmlInfo.appDirectoryName + "/lib" ] = PATH.join( htmlInfo.appProjectPath, "lib" );

 	if ( appConfig.copyList ) {
 		for ( i = 0; i < appConfig.copyList.length; i++ ) {
 			copyDirMap[ PATH.join( htmlInfo.appDirectoryName, appConfig.copyList[ i ] ) ] = PATH.join( htmlInfo.appProjectPath, appConfig.copyList[ i ] );
 		}
 	}

 	for ( key in copyDirMap ) {
 		value = copyDirMap[ key ];
 		if ( FSE.existsSync( value ) ) {
 			console.log( "copy " + value.red + " to " + PATH.join( distPath, key ).red );
 			FSE.copySync( value, PATH.join( distPath, key ) );
 		}
 	}

 	htmlInfo.projectDistPath = distPath;

 	buildLibJSFromHead( null, appConfig, htmlInfo, PATH.join( projectDistPath, appDistProjectPath, "amdquery" ) );
 }

 function buildLibJSFromHead( appConfig, htmlInfo, AMDQueryPath, buildAppJS ) {
 	if ( appConfig.includeLibJSFromHead ) {
 		function getScriptCotent( script ) {
 			var script = script[ 0 ],
 				content = "";
 			if ( script ) {
 				if ( script.attribs && script.attribs[ "src" ] ) {
 					content += FSE.readFileSync( PATH.join( htmlInfo.appProjectPath, script.attribs[ "src" ] ) ).toString() + "\n";
 				} else {
 					if ( script.children && script.children[ 0 ] ) {
 						content += script.children[ 0 ].data + "\n";
 					}
 				}
 			}
 			return content;
 		}

 		var tr = trumpet();
 		var scripts = [];

 		console.log( ( '\r\nBuild library javascript from HTML head of"' + htmlInfo.appName + '"' ).red );

 		tr.selectAll( "head script", function( script ) {
 			var scriptStream = script.createStream( {
 				outer: true
 			} );
 			var scriptStr = "";
 			scriptStream.pipe( through( function( buf ) {
 				scriptStr += buf.toString();
 			}, function() {
 				var handler = new htmlparser.DefaultHandler( function( error, dom ) {
 					if ( error ) {
 						buildAppJS( error );
 					}
 				} );
 				var parser = new htmlparser.Parser( handler );
 				parser.parseComplete( scriptStr );
 				scripts.push( handler.dom );
 			} ) ).pipe( scriptStream );

 		} );

 		FSE.createReadStream( htmlInfo.htmlPath ).pipe( tr ).on( 'close', function() {
 			var ramdquery = /amdquery\/amdquery\.js/,
 				i, script, amdqueryJSIndex = -1;
 			//Find amdquery.js index
 			for ( i = scripts.length - 1; i >= 0; i-- ) {
 				script = scripts[ i ];
 				script = script[ 0 ];
 				if ( script && script.attribs && ramdquery.test( script.attribs[ "src" ] ) ) {
 					amdqueryJSIndex = i;
 				}
 			}

 			if ( amdqueryJSIndex == -1 ) {
 				buildAppJS( "Can not find 'amdquery/amdquery.js' in '" + htmlInfo.htmlPath + "'" );
 			}

 			htmlInfo._amdqueryJSIndex = amdqueryJSIndex;

 			var bLibJSContent = "";

 			for ( i = 0; i < amdqueryJSIndex; i++ ) {
 				script = scripts[ i ];
 				if ( script ) {
 					bLibJSContent += getScriptCotent( script );
 				}
 			}

 			if ( bLibJSContent != "" ) {
 				console.log( ( "\r\n Save library javascript which before amdquery.js from '" + htmlInfo.htmlPath + "'head " ).red );
 				htmlInfo.beforeLibRelativeJSPath = PATH.join( "lib", "beforelib.js" );
 				htmlInfo.beforeLibJSPath = PATH.join( htmlInfo.projectDistPath, htmlInfo.appDirectoryName, htmlInfo.beforeLibRelativeJSPath );
 				if ( !appConfig.debug ) {
 					bLibJSContent = util.minifyContent( bLibJSContent );
 				}
 				FSE.writeFileSync( htmlInfo.beforeLibJSPath, bLibJSContent );
 			}

 			var aLibJSContent = "";

 			for ( i = amdqueryJSIndex + 1; i < scripts.length; i++ ) {
 				script = scripts[ i ];
 				if ( script ) {
 					aLibJSContent += getScriptCotent( script );
 				}
 			}

 			if ( aLibJSContent != "" ) {
 				console.log( ( "\r\n Save library javascript which after amdquery.js from '" + htmlInfo.htmlPath + "'head" ).red );
 				htmlInfo.afterLibRelativeJSPath = PATH.join( "lib", "afterlib.js" );
 				htmlInfo.afterLibJSPath = PATH.join( htmlInfo.projectDistPath, htmlInfo.appDirectoryName, htmlInfo.afterLibRelativeJSPath );
 				if ( !appConfig.debug ) {
 					aLibJSContent = util.minifyContent( aLibJSContent );
 				}
 				FSE.writeFileSync( htmlInfo.afterLibJSPath, aLibJSContent );
 			}

 			buildAppJS( null, appConfig, htmlInfo, AMDQueryPath );
 		} );
 	} else {
 		buildAppJS( null, appConfig, htmlInfo, AMDQueryPath );
 	}
 }

 function buildAppJS( appConfig, htmlInfo, AMDQueryPath, buildAppXML ) {
 	if ( !htmlInfo.appConfig.src ) {
 		buildAppXML( htmlInfo.htmlPath + ": 'app' of attribute must define 'src'" );
 	}

 	var dirPath = PATH.dirname( htmlInfo.appConfig.src );
 	dirPath = dirPath.replace( /\/$/, "" ),
 	jsBuilder = new util.JSBuilder( AMDQueryJSPath, {
 		'oyeModulePath': amdqueryPath,
 		'projectRootPath': projectRootPath
 	} );

 	jsBuilder.setUglifyOptions( buildConfig.uglifyOptions );

 	oye.require.variablePrefix( "@" );
 	oye.require.variable( "app", dirPath );

 	console.log( ( '\r\nBuild "' + htmlInfo.appName + '" js file' ).red );

 	htmlInfo.AMDQueryJSPath = PATH.join( AMDQueryPath, "amdquery" );
 	htmlInfo.AMDQueryJSRelativeHTMLPath = "../amdquery/amdquery";

 	jsBuilder.launch( htmlInfo.appName, htmlInfo.AMDQueryJSPath, htmlInfo.appConfig.src, function( name, moduleList, minPath, minContent, deubugPath, content ) {
 		var XMLAndCSSPathList = getXMLAndCSS( htmlInfo, moduleList );
 		buildAppXML( null, appConfig, htmlInfo, XMLAndCSSPathList );
 	} );

 }

 function buildAppXML( appConfig, htmlInfo, XMLAndCSSPathList, buildAppCss ) {
 	console.log( ( '\r\nBuild "' + htmlInfo.appName + '" xml file ' ).red );
 	htmlInfo.viewContentID = "aQueryViewContentKey";
 	var content = '<div id="' + htmlInfo.viewContentID + '" >',
 		xmlPathList = XMLAndCSSPathList.xmlPathList,
 		i = 0,
 		xmlItem = null,
 		len = xmlPathList.length;

 	for ( ; i < len; i++ ) {
 		xmlItem = xmlPathList[ i ];
 		content += '\n<div ' + htmlInfo.viewContentID + '="' + xmlItem.key + '" >' + FSE.readFileSync( xmlItem.path );
 		content += "\n</div>";
 	}

 	content += "\n</div>"
 	htmlInfo.appCombinationXMLRelativePath = PATH.join( htmlInfo.appDirectoryName, "xml/combination.xml" );
 	htmlInfo.appCombinationXMLPath = PATH.join( htmlInfo.projectDistPath, htmlInfo.appCombinationXMLRelativePath );

 	console.log( '\r\nSave app Combination xml: ' + htmlInfo.appCombinationXMLPath );

 	FSE.writeFileSync( htmlInfo.appCombinationXMLPath, content );

 	buildAppCss( null, appConfig, htmlInfo, XMLAndCSSPathList );
 }


 function buildAppCss( appConfig, htmlInfo, XMLAndCSSPathList, buildUICss ) {
 	console.log( ( '\r\nBuild "' + htmlInfo.appName + '" css file ' ).red );

 	var
 	pathList = htmlInfo.cssPath,
 		resultPath = [],
 		CSSPathList = XMLAndCSSPathList.cssPathList;

 	pathList.forEach( function( item, index ) {
 		var path = "";
 		//绝对路径 项目路径下
 		if ( /^\//.test( item ) ) {
 			path = PATH.join( amdqueryPath, "..", item.replace( /^\//, "" ) );
 		} else {
 			path = PATH.join( PATH.dirname( htmlInfo.htmlPath ), item );
 		}
 		console.log( "buildAppCss css path:", path );
 		resultPath.push( path );
 	} );

 	CSSPathList.forEach( function( item ) {
 		resultPath.push( item.path );
 	} );

 	if ( resultPath.length ) {
 		htmlInfo.appCombinationCssRelativePath = PATH.join( "styles", htmlInfo.appDirectoryName + ".css" );

 		htmlInfo.appCombinationCssPath = PATH.join( htmlInfo.projectDistPath, htmlInfo.appDirectoryName, htmlInfo.appCombinationCssRelativePath );
 		console.log( htmlInfo.appCombinationCssPath )
 		_buildCssAndSave( resultPath, htmlInfo.appCombinationCssPath );

 		console.log( '\r\nSave app Combination css: ' + htmlInfo.appCombinationCssPath );
 	} else {
 		console.warn( '\r\nDoes not find any css!' );
 	}

 	buildUICss( null, appConfig, htmlInfo );
 }

 function buildUICss( appConfig, htmlInfo, modifyHTML ) {
 	console.log( '\r\nBuild css of AMDQuery-UI '.red );
 	var
 	cwd = PATH.join( AMDQueryJSRootPath, "ui", "css" ),
 		globOpt = {
 			cwd: cwd
 		}
 	htmlInfo.uiCombinationRelativeCssPath = "amdquery/ui/css/amdquery-widget.css";

 	if ( appConfig.detectUIWidgetCSS ) {
 		detectUIWidgetCSS( cwd, appConfig, htmlInfo, function( cssFileList ) {
 			_buildUICss( cwd, cssFileList, appConfig, htmlInfo );
 			modifyHTML( null, appConfig, htmlInfo );
 		} );
 	} else {
 		var cssFileList = glob.sync( "*.css", globOpt );
 		_buildUICss( cwd, cssFileList, appConfig, htmlInfo );
 		modifyHTML( null, appConfig, htmlInfo );
 	}
 }

 function _buildUICss( cwd, cssFileList, appConfig, htmlInfo ) {
 	// UICssPath(defined in Head) is first, html defined css is second, config defined css is lastest.
 	cssFileList = _.union( htmlInfo.UICssPath.concat( cssFileList.concat( appConfig.UIWidgetCSS || [] ) ) );

 	var uiCombinationCssPath = PATH.join( htmlInfo.projectDistPath, htmlInfo.uiCombinationRelativeCssPath );

 	_buildCssAndSave( cssFileList, uiCombinationCssPath, cwd );

 	console.log( '\r\nSave UI amdquery-widget.css: ', uiCombinationCssPath );

 }

 function detectUIWidgetCSS( cwd, appConfig, htmlInfo, callback ) {
 	var widgetTr = trumpet(),
 		cssFileList = [];
 	widgetTr.selectAll( "*", function( link ) {
 		link.getAttribute( "amdquery-widget", function( value ) {

 			var UIList = value.split( /;|,/ ),
 				i = 0,
 				len = UIList.length;

 			for ( ; i < len; i++ ) {
 				var tempPath = UIList[ i ].split( "." );
 				if ( ( tempPath.length == 1 || tempPath[ 0 ] == "ui" ) && tempPath[ 0 ] != "" ) {
 					var path = tempPath[ 1 ] + ".css",
 						detect_path = PATH.join( cwd, tempPath[ 1 ] + ".css" );
 					if ( FSE.existsSync( detect_path ) ) {
 						logger( "[DEBUG]".white, "add UI css:".white, detect_path.white );
 						cssFileList.push( path );
 					} else {
 						logger( "[WARN]".red, "the css path:", detect_path, "not found" );
 					}
 				}
 			}
 		} );
 	} );
 	var read = FSE.createReadStream( htmlInfo.appCombinationXMLPath ).pipe( widgetTr );

 	read.on( 'end', function() {
 		callback( _.union( cssFileList ) );
 	} );

 }

 function modifyHTML( appConfig, htmlInfo, finish ) {
 	var linkTr1 = trumpet(),
 		linkTr2 = trumpet(),
 		scriptTr = trumpet(),
 		bodyTr = trumpet();


 	htmlInfo.distHtmlPath = PATH.join( htmlInfo.projectDistPath, htmlInfo.appDirectoryName, "app.html" );

 	var cssList = [],
 		append = "",
 		i = 0;

 	linkTr1.selectAll( 'link[type="text/css"]', function( link ) {
 		link.getAttribute( "href", function( value ) {
 			cssList.push( value );
 		} );
 	} );

 	linkTr2.selectAll( 'link[type="text/css"]', function( link ) {
 		var ws = link.createWriteStream( {
 			outer: true
 		} );

 		ws.end( "<!-- annotate by build link.src: " + cssList[ i++ ] + " -->\n" );
 	} );

 	var amdqueryJSIndex = htmlInfo._amdqueryJSIndex,
 		index = 0;

 	scriptTr.selectAll( "head script", function( script ) {

 		var scriptStream = script.createStream( {
 			outer: true
 		} );
 		if ( index++ == amdqueryJSIndex ) {
 			var scriptStr = "";
 			scriptStream.pipe( through( function( buf ) {
 				scriptStr += buf.toString();
 			}, function() {
 				var handler = new htmlparser.DefaultHandler( function( error, dom ) {} );
 				var parser = new htmlparser.Parser( handler );
 				parser.parseComplete( scriptStr );
 				var append = "";

 				append = '<link href="' + "../" + htmlInfo.uiCombinationRelativeCssPath + '" rel="stylesheet" type="text/css" />\n';
 				logger( "[DEBUG]".white, "add css".white, htmlInfo.uiCombinationRelativeCssPath.white );

 				if ( htmlInfo.appCombinationCssRelativePath ) {
 					append += '<link href="' + htmlInfo.appCombinationCssRelativePath + '" rel="stylesheet" type="text/css" />\n';
 					logger( "[DEBUG]".white, "add css".white, htmlInfo.appCombinationCssRelativePath.white );
 				}

 				if ( htmlInfo.beforeLibRelativeJSPath ) {
 					append += '<script src="' + htmlInfo.beforeLibRelativeJSPath + '" type="text/javascript"></script>\n';
 					logger( "[DEBUG]".white, "add js".white, htmlInfo.beforeLibRelativeJSPath.white );
 				}

 				var config = handler.dom[ 0 ].attribs;
 				var app = config.app;
 				var appObject = {
 					src: PATH.join( "..", htmlInfo.appDirectoryName, "app" ),
 					development: "0",
 					debug: !! appConfig.debug,
 					viewContentID: htmlInfo.viewContentID
 				}
 				var amdqueryattribs = [];

 				if ( config.app ) {
 					_.extend( splitAttrToObject( config.app ), appObject );
 				}

 				if ( appConfig.debug ) {
 					config.src = PATH.join( PATH.dirname( config.src ), PATH.basename( config.src, '.js' ) + DebugJSSuffix );
 				}

 				config.app = formatToAttr( appObject );

 				for ( var key in config ) {
 					amdqueryattribs.push( key + '="' + config[ key ] + '"' );
 				}

 				logger( "[DEBUG]".white, "amdquery.js attributes:".white, amdqueryattribs.join( " " ).white );

 				logger( "[DEBUG]".white, "script setAttribute app".white, ( "src = " + appObject.src ).white );
 				logger( "[DEBUG]".white, "script setAttribute app".white, ( "development = " + appObject.development ).white );
 				logger( "[DEBUG]".white, "script setAttribute app".white, ( "debug = " + appObject.debug ).white );
 				logger( "[DEBUG]".white, "script setAttribute app".white, ( "viewContentID = " + appObject.viewContentID ).white );
 				append += '<script ' + amdqueryattribs.join( " " ) + '></script>\n';

 				if ( htmlInfo.afterLibRelativeJSPath ) {
 					append += '<script src="' + htmlInfo.afterLibRelativeJSPath + '" type="text/javascript"></script>';
 					logger( "[DEBUG]".white, "add js".white, htmlInfo.afterLibRelativeJSPath.white );
 				}

 				this.queue( append );
 			} ) ).pipe( scriptStream );
 		} else {
 			scriptStream.end( "" );
 		}

 	} );

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
 		console.log( ( '\r\n' + htmlInfo.appName + ' building finish... ' ).red );
 		finish( null );
 	} );

 	FSE.createReadStream( htmlInfo.htmlPath ).pipe( linkTr1 ).pipe( linkTr2 ).pipe( scriptTr ).pipe( bodyTr ).pipe( write );
 }

 var apps = buildConfig.apps.concat();

 function main() {
 	if ( apps.length ) {
 		var appConfig = apps.shift();
 		var defaultConfig = {
 			debug: true,
 			detectUIWidgetCSS: true,
 			UIWidgetCSS: [],
 			aQueryConfig: false,
 			includeLibJsInHead: true
 		}

 		_.extend( defaultConfig, appConfig );

 		console.log( ( '\r\nStart building app ' + appConfig.name + ' ... ' ).magenta );

 		async.waterfall( [

       function( callback ) {
 				callback( null, defaultConfig );
       },
       getAppaQueryConfig,
       openHtml,
       createAppDirAndCopyFile,
       buildLibJSFromHead,
       buildAppJS,
       buildAppXML,
       buildAppCss,
       buildUICss,
       modifyHTML
     ], function( err, result ) {
 			if ( err ) {
 				console.error( "[Error]".red, err.red );
 			}
 			main();
 		} );

 	}
 }

 function getXMLAndCSS( htmlInfo, moduleList ) {
 	var i = 0,
 		len = moduleList.length,
 		mdItem, xmlPath, xmlPathList = [],
 		cssPath, cssPathList = [],
 		reg = new RegExp( htmlInfo.appDirectoryName + "\/" + "views\/(.*)" );
 	for ( ; i < len; i++ ) {
 		mdItem = moduleList[ i ];
 		if ( reg.test( mdItem.name ) ) {
 			xmlPath = PATH.join( htmlInfo.appProjectPath, "xml", RegExp.$1 + ".xml" );
 			cssPath = PATH.join( htmlInfo.appProjectPath, "styles", RegExp.$1 + ".css" );
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

 if ( !apps.length ) {
  console.log( "No application to build" );
 }

 main();