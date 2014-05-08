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
var DOMParser = require( 'xmldom' ).DOMParser;
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
			if ( typeof aQueryConfig ) {
				_.extend( htmlInfo.appConfig, aQueryConfig.app );
				openHtml( null, appConfig, htmlInfo );
			}

		} catch ( e ) {
			openHtml( "getAppaQueryConfig: Find aQueryConfig but eval it fail." );
		}
	};

	if ( appConfig.aQueryConfig == true ) {

		var htmlString = FSE.readFileSync( htmlPath );

		var doc = new DOMParser().parseFromString( htmlString.toString(), 'text/html' );

		var head = doc.documentElement.getElementsByTagName( "head" )[ 0 ];
		var scripts = head.getElementsByTagName( "script" );

		for ( var i = 0, len = scripts.length, script, scriptInnerHTML; i < len; i++ ) {
			script = scripts[ i ];
			if ( script.hasChildNodes() ) {
				scriptInnerHTML = script.firstChild.toString();
				if ( raQueryConfig.test( scriptInnerHTML ) ) {
					aQueryConfigStr = scriptInnerHTML;
					break;
				}
			}
		}

		if ( aQueryConfigStr ) {
			doNext( aQueryConfigStr );
		} else {
			openHtml( "getAppaQueryConfig: You set 'appConfig.aQueryConfig' true, but can not find aQueryConfig in head of HTML." );
		}
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

	var htmlString = FSE.readFileSync( htmlInfo.htmlPath );

	var doc = new DOMParser().parseFromString( htmlString.toString(), 'text/html' );

	var head = doc.documentElement.getElementsByTagName( "head" )[ 0 ];
	var links = head.getElementsByTagName( "link" ),
		link,
		scripts = head.getElementsByTagName( "script" ),
		script;

	var i = 0,
		len = links.length;

	for ( ; i < len; i++ ) {
		link = links[ i ];
		if ( link.hasAttribute( "type" ) && link.hasAttribute( "href" ) && link.getAttribute( "type" ) == "text/css" ) {
			var href = link.getAttribute( "href" );
			if ( href.indexOf( "amdquery/ui/css" ) == -1 ) {
				logger( "[DEBUG]".white, "css link".white, href.white );
				htmlInfo.cssPath.push( href );
			} else {
				logger( "[DEBUG]".white, "UI css link".white, href.white );
				htmlInfo.UICssPath.push( PATH.basename( href ) );
			}
		}
	}

	for ( i = 0, len = scripts.length; i < len; i++ ) {
		script = scripts[ i ];
		if ( script.hasAttribute( "app" ) ) {
			var str = script.getAttribute( "app" );
			_.extend( htmlInfo.appConfig, splitAttrToObject( str ) );
			logger( "[DEBUG]".white, "Config in app".white, str.white );
			break;
		}
	}

	createAppDirAndCopyFile( null, appConfig, htmlInfo );
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

	var globalName = "global";

	var globalPath = PATH.join( htmlInfo.appProjectPath, "..", globalName ),
		globalDistPath = PATH.join( distPath, globalName );

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
			var content = "";
			if ( script.hasAttribute( "src" ) ) {
				var path = util.fixPath( script.getAttribute( "src" ), htmlInfo.htmlPath, projectRootPath );
				content += FSE.readFileSync( path ).toString() + "\n";
			} else {
				if ( script.hasChildNodes() ) {
					content += script.firstChild.toString() + "\n";
				}
			}
			return content;
		};

		var htmlString = FSE.readFileSync( htmlInfo.htmlPath );

		var doc = new DOMParser().parseFromString( htmlString.toString(), 'text/html' );

		var head = doc.documentElement.getElementsByTagName( "head" )[ 0 ];

		var scripts = head.getElementsByTagName( "script" );

		var ramdquery = /amdquery\/amdquery\.js/,
			i, script, amdqueryJSIndex = -1;
		//Find amdquery.js index
		for ( i = scripts.length - 1; i >= 0; i-- ) {
			script = scripts[ i ];
			if ( ramdquery.test( script.getAttribute( "src" ) ) ) {
				amdqueryJSIndex = i;
				break;
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
			console.log( "\r\nSave library javascript which before amdquery.js from '" + htmlInfo.htmlPath + "'head " );
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
			console.log( "\r\nSave library javascript which after amdquery.js from '" + htmlInfo.htmlPath + "'head" );
			htmlInfo.afterLibRelativeJSPath = PATH.join( "lib", "afterlib.js" );
			htmlInfo.afterLibJSPath = PATH.join( htmlInfo.projectDistPath, htmlInfo.appDirectoryName, htmlInfo.afterLibRelativeJSPath );
			if ( !appConfig.debug ) {
				aLibJSContent = util.minifyContent( aLibJSContent );
			}
			FSE.writeFileSync( htmlInfo.afterLibJSPath, aLibJSContent );
		}

	}
	buildAppJS( null, appConfig, htmlInfo, AMDQueryPath );
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

	htmlInfo.AMDQueryJSPath = PATH.join( AMDQueryPath );

	jsBuilder.launch( "amdquery", htmlInfo.AMDQueryJSPath, htmlInfo.appConfig.src, function( name, moduleList, minPath, minContent, deubugPath, content ) {
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

	content = beautify_html( content );

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
		var path = util.fixPath( item, htmlInfo.htmlPath, projectRootPath );

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
		var cssFileList = detectUIWidgetCSS( cwd, appConfig, htmlInfo );

		_buildUICss( cwd, cssFileList, appConfig, htmlInfo );
		modifyHTML( null, appConfig, htmlInfo );
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

function detectUIWidgetCSS( cwd, appConfig, htmlInfo ) {
	var cssFileList = [],
		noExists = {};
	var xmlString = FSE.readFileSync( htmlInfo.appCombinationXMLPath );

	var doc = new DOMParser().parseFromString( xmlString.toString(), 'text/xml' );

	var nodes = doc.documentElement.getElementsByTagName( "*" ),
		i = 0,
		node = null,
		len = nodes.length,
		attr = "";

	for ( ; i < len; i++ ) {
		node = nodes[ i ];
		attr = node.getAttribute( "amdquery-widget" );
		if ( attr ) {
			var UIList = attr.split( /;|,/ ),
				j = 0;
			for ( ; j < UIList.length; j++ ) {
				var tempPath = UIList[ j ].split( "." );
				if ( ( tempPath.length == 1 || tempPath[ 0 ] == "ui" ) && tempPath[ 0 ] != "" ) {
					var path = tempPath[ 1 ] + ".css",
						detect_path = PATH.join( cwd, tempPath[ 1 ] + ".css" );

					if ( cssFileList.indexOf( path ) !== -1 || noExists[ path ] ) {
						continue;
					}

					if ( FSE.existsSync( detect_path ) ) {
						logger( "[DEBUG]".white, "add UI css:".white, detect_path.white );
						cssFileList.push( path );
					} else {
						noExists[ path ] = true
						logger( "[WARN]".red, "the css path:", detect_path, "not found" );
					}
				}
			}
		}
	}

	// cssFileList = _.union( cssFileList );

	return cssFileList;

}

function modifyHTML( appConfig, htmlInfo, finish ) {
	var xmlString = FSE.readFileSync( htmlInfo.htmlPath );

	var doc = new DOMParser().parseFromString( xmlString.toString(), 'text/html' );

	var head = doc.documentElement.getElementsByTagName( "head" )[ 0 ],
		body = doc.documentElement.getElementsByTagName( "body" )[ 0 ],
		links = head.getElementsByTagName( "link" ),
		scripts = head.getElementsByTagName( "script" ),
		removeIndex = 0,
		amdqueryJSIndex = htmlInfo._amdqueryJSIndex,
		aQueryScript = scripts[ amdqueryJSIndex ],
		link,
		i = 0,
		len = 0;

	htmlInfo.distHtmlPath = PATH.join( htmlInfo.projectDistPath, htmlInfo.appDirectoryName, "app.html" );

	for ( i = 0, len = links.length; i < len; i++ ) {
		link = links[ i ];
		if ( link.getAttribute( "type" ) == "test/css" ) {
			head.removeChild( link );
		}
	}

	var uiCssLink = doc.createElement( "link" );
	uiCssLink.setAttribute( "href", "../" + htmlInfo.uiCombinationRelativeCssPath );
	uiCssLink.setAttribute( "rel", "stylesheet" );
	uiCssLink.setAttribute( "type", "text/css" );

	head.insertBefore( uiCssLink, aQueryScript );
	logger( "[DEBUG]".white, "add css".white, htmlInfo.uiCombinationRelativeCssPath.white );

	if ( htmlInfo.appCombinationCssRelativePath ) {
		var appCssLink = doc.createElement( "link" );
		appCssLink.setAttribute( "href", htmlInfo.appCombinationCssRelativePath );
		appCssLink.setAttribute( "rel", "stylesheet" );
		appCssLink.setAttribute( "type", "text/css" );

		head.insertBefore( appCssLink, aQueryScript );
		logger( "[DEBUG]".white, "add css".white, htmlInfo.appCombinationCssRelativePath.white );
	}

	if ( htmlInfo.beforeLibRelativeJSPath ) {
		var beforeLibJS = doc.createElement( "script" );
		beforeLibJS.setAttribute( "src", htmlInfo.beforeLibRelativeJSPath );
		beforeLibJS.setAttribute( "type", "text/javascript" );

		for ( i = 0; i < amdqueryJSIndex; i++ ) {
			removeIndex++;
			head.removeChild( scripts[ i ] );
		}

		beforeLibJS.appendChild( doc.createTextNode( "" ) );

		removeIndex--;
		head.insertBefore( beforeLibJS, aQueryScript );
		logger( "[DEBUG]".white, "add js".white, htmlInfo.beforeLibRelativeJSPath.white );
	}

	var appObject = {
		development: "0",
		debug: !! appConfig.debug,
		viewContentID: htmlInfo.viewContentID
	}

	var amdqueryattribs = [];
	var config = {};

	if ( aQueryScript.hasAttribute( "app" ) ) {
		_.extend( config, splitAttrToObject( aQueryScript.getAttribute( "app" ) ), appObject );
	} else {
		config = appObject;
	}

	logger( "[DEBUG]".white, "script setAttribute app".white, ( "src = " + config.src ).white );
	logger( "[DEBUG]".white, "script setAttribute app".white, ( "development = " + config.development ).white );
	logger( "[DEBUG]".white, "script setAttribute app".white, ( "debug = " + config.debug ).white );
	logger( "[DEBUG]".white, "script setAttribute app".white, ( "viewContentID = " + config.viewContentID ).white );

	aQueryScript.setAttribute( "app", formatToAttr( config ) );

	if ( appConfig.debug ) {
		var
		originSrc = aQueryScript.getAttribute( "src" ),
			src = PATH.join( PATH.dirname( originSrc ), PATH.basename( originSrc, '.js' ) + DebugJSSuffix );
		htmlInfo.AMDQueryJSRelativeHTMLPath = src;
		aQueryScript.setAttribute( "src", htmlInfo.AMDQueryJSRelativeHTMLPath );
	}

	if ( htmlInfo.afterLibRelativeJSPath ) {
		var afterLibJS = doc.createElement( "script" );
		afterLibJS.setAttribute( "src", htmlInfo.afterLibRelativeJSPath );
		afterLibJS.setAttribute( "type", "text/javascript" );

		for ( i = amdqueryJSIndex - removeIndex, len = scripts.length; len > i; len-- ) {
			head.removeChild( scripts[ len ] );
		}

		afterLibJS.appendChild( doc.createTextNode( "" ) );

		head.appendChild( afterLibJS, aQueryScript );
		logger( "[DEBUG]".white, "add js".white, htmlInfo.afterLibRelativeJSPath.white );
	}

	var html = new DOMParser().parseFromString( FSE.readFileSync( htmlInfo.appCombinationXMLPath ).toString(), 'text/html' )

	body.appendChild( html.documentElement );

	FSE.writeFileSync( htmlInfo.distHtmlPath, beautify_html( doc.toString() ) );

	if ( typeof appConfig.complete == "function" ) {
		appConfig.complete.call( appConfig, htmlInfo );
	}

	console.log( ( '\r\n' + htmlInfo.appName + ' building finish... ' ).red );

	return finish( null );
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