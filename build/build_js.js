var buildConfig = {
	debug: false,
	amdqueryPath: '../amdquery/',
	projectRootPath: '../', // server root
	distPath: 'dist/',
	pathVariable: {

	},
	defines: {}
};
var _ = require( "underscore" );

var PATH = require( 'path' );

var argvs = process.argv;

var buildFileRootPath = PATH.dirname( process.argv[ 1 ] );

var buildConfigFile = process.argv[ 2 ];
if ( buildConfigFile && /\.js/.test( buildConfigFile ) ) {
	if ( !( /^\.*\//.test( buildConfigFile ) ) ) {
		buildConfigFile = PATH.join( buildFileRootPath, "build_js_config.js" );
	}
	buildConfigFile = require( buildConfigFile );
	buildConfig = _.extend( buildConfig, buildConfigFile );
}


var FSE = require( 'fs-extra' );

//Configurate oye.js
var amdqueryPath = PATH.join( buildFileRootPath, buildConfig.amdqueryPath );

//Configurate project root path
var projectRootPath = PATH.join( buildFileRootPath, buildConfig.projectRootPath );

var util = require( './lib/util.js' );

var oye = require( './lib/oye.node.js' );

oye.setPath( {
	'oyeModulePath': amdqueryPath,
	'projectRootPath': projectRootPath
} );

var logger = buildConfig.debug ? console.info : function() {};

logger( buildFileRootPath );

var colors = require( "colors" );

var glob = require( "glob" );
var async = require( "async" );

var amdqueryContent = "";
var AMDQueryJSPath = PATH.join( buildFileRootPath, buildConfig.amdqueryPath, "amdquery.js" );
var AMDQueryJSRootPath = PATH.join( buildFileRootPath, buildConfig.amdqueryPath );
var projectDistPath = PATH.join( buildFileRootPath, buildConfig.distPath );

var DebugJSSuffix = "-debug.js";

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
				console.error( err );
			}
		},
		content,
		minContent,
		defineConfig,
		name,
		path,
		deubugPath,
		minPath;

	util.mkdirSync( dirPath );

	console.log( '\r\nBegin write file'.red );

	for ( name in result ) {
		list = result[ name ];
		defineConfig = buildConfig.defines[ name ];
		len = list.length;
		name = name.replace( /^\/+/, '' );
		path = PATH.join( dirPath, name.replace( /[^\/]*$/, '' ) );
		deubugPath = PATH.join( dirPath, name + DebugJSSuffix );
		minPath = PATH.join( dirPath, name + '.js' );

		content = list.join( "\r\n" );
		minContent = util.minifyContent( content );

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

function main() {
	console.log( '\r\nStart building defines... '.magenta );

	setPathVariable( buildConfig.pathVariable );

	// build defines
	async.waterfall( [
     readBaseAMDQueryJS,
     buildDefines,
     saveJSFile
   ], function( err, result ) {
		if ( err ) {
			console.error( "[Error]".red, err.red );
			return;
		}

	} );
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
			console.info( '\r\nDependencies length of module ' + module._amdID + ': ' + dependencies.length );
		}

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

		console.info( ( '\r\nthe defines "' + name + '" Dependencies length of file ' + result.length ).red );

		callback( name, result, list );
	} );
}

function editDefine( content, module ) {
	content = "/*===================" + module + "===========================*/\r\n" + content;
	var r = /define\s*\(\s*(['"])[^\1]*\1/i;
	if ( !r.test( content ) ) {
		content = content.replace( /define\(/, 'define("' + module + '",' );
	}
	content += "\r\n\r\n/*=======================================================*/\r\n";
	return content;
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

function setPathVariable( obj ) {
	for ( var name in obj ) {
		oye.require.variable( name, obj[ name ] );
	}
}

main();