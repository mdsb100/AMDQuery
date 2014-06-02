var buildConfig = {
	debug: false,
	amdqueryPath: '../amdquery/',
	projectRootPath: '../', // server root
	distPath: 'dist/',
	pathVariable: {

	},
	defines: {},
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

var amdqueryPath = PATH.join( buildFileRootPath, buildConfig.amdqueryPath );

//Configurate project root path
var projectRootPath = PATH.join( buildFileRootPath, buildConfig.projectRootPath );

var util = require( './lib/util.js' );

var oye = require( './lib/oye.node.js' );

var colors = require( "colors" );

var glob = require( "glob" );
var async = require( "async" );

var amdqueryContent = "";
var AMDQueryJSPath = PATH.join( buildFileRootPath, buildConfig.amdqueryPath, "amdquery.js" );
var AMDQueryJSRootPath = PATH.join( buildFileRootPath, buildConfig.amdqueryPath );
var projectDistPath = PATH.join( buildFileRootPath, buildConfig.distPath );
var JSBuilder = util.JSBuilder;

function buildDefines() {
	setPathVariable( buildConfig.pathVariable );

	var distPath = PATH.join( projectDistPath, "defines" );
	if ( !buildConfig.defines ) {
    console.log( "No javascript to build" );
		return;
	}
	var l = 0,
		nameList = [],
		name;

	for ( name in buildConfig.defines ) {
		l++;
		nameList.push( name );
	}

	if ( l === 0 ) {
    console.log( "No javascript to build" );
		return;
	}
	var jsBuilder = new JSBuilder( AMDQueryJSPath, {
		'oyeModulePath': amdqueryPath,
		'projectRootPath': projectRootPath
	} )

	function toBuild() {
		var name;
		if ( nameList.length ) {
			name = nameList.pop();
		} else {
			console.log( "Build defines finish" );
			return;
		}
		var item,
			requireList;

		item = buildConfig.defines[ name ];
		requireList = checkJSDirectory( item.directory );

		requireList = requireList.concat( filterDependencies( item.path.replace( ".js", "" ) ) );
		jsBuilder.setUglifyOptions( buildConfig.uglifyOptions );
		jsBuilder.launch( name, distPath, requireList, function( name, moduleList, minPath, minContent, deubugPath, content ) {
			var defineConfig = buildConfig.defines[ name ];
			if ( defineConfig && typeof defineConfig.complete === "function" ) {
				defineConfig.complete.call( defineConfig, minPath, minContent, deubugPath, content );
				toBuild();
			}
		} );
	}

	toBuild();

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

buildDefines();