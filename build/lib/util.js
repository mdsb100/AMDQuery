var uglifyOptions = {
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

var _ = require( "underscore" );

var uglify = require( 'uglify-js' );

var FSE = require( 'fs-extra' );
var PATH = require( 'path' );

function minify( orig_code, options ) {
	options = {}
	_.extend( options, uglifyOptions );
	var jsp = uglify.parser;
	var pro = uglify.uglify;

	var ast = jsp.parse( orig_code, options.strict_semicolons ); // parse code and get the initial AST
	ast = pro.ast_mangle( ast, options.mangle_options ); // get a new AST with mangled names
	ast = pro.ast_squeeze( ast, options.squeeze_options ); // get an AST with compression optimizations
	var final_code = pro.gen_code( ast, options.gen_options ); // compressed code here
	return final_code;
};

exports.minifyContent = function( content, uglifyOptions ) {
	try {
		var minContent = minify( content, uglifyOptions );
		return minContent;
	} catch ( e ) {
		var line = e.line,
			start = ( line > 10 ? line - 10 : 0 ),
			end = line + 10;
		//var line = e.line, start = 0, end = undefined;
		console.log( ( e.message + ' Line: ' + line ).red );
		content = content.split( /(?:\r\n|[\r\n])/ )
			.slice( start, end );
		var errCode = [],
			lineNumber, code;
		for ( var i = 0; i < content.length; i++ ) {
			lineNumber = i + start + 1;
			code = ( lineNumber === line ) ? ( ( lineNumber + ' ' + content[ i ] ).red ) : ( lineNumber + content[ i ] ).red;
			errCode.push( code );
		}
		console.log( errCode.join( '\r\n' ) );
		return null;
	}
}

exports.mkdirSync = function( path ) {
	if ( !path || FSE.existsSync( path ) ) {
		return;
	}
	var r = /(?=[\\\/]+)/;
	var list = path.split( r );
	var l = list.length;
	var _path;
	for ( var i = 1; i < l; i++ ) {
		_path = list.slice( 0, i ).join( '' );
		if ( FSE.existsSync( _path ) ) {
			continue;
		}
		FSE.mkdirSync( _path );
	}
	if ( !FSE.existsSync( path ) ) {
		FSE.mkdirSync( path );
	}

}

var async = require( "async" );
var oye = require( './oye.node.js' );
var DebugJSSuffix = "-debug.js";

function JSBuilder( AMDQueryJSPath, oyeOpt ) {
	this.AMDQueryJSPath = AMDQueryJSPath;
	this.originOyeOpt = {
		oyeModulePath: oye.getBasePath(),
		projectRootPath: oye.getRootPath()
	}
	oye.setPath( oyeOpt || this.originOpt );

}

JSBuilder.amdqueryContent = "";

JSBuilder.prototype = {
	constructor: JSBuilder,
	editDefine: function( content, module ) {
		content = "/*===================" + module + "===========================*/\r\n" + content;
		var r = /define\s*\(\s*(['"])[^\1]*\1/i;
		if ( !r.test( content ) ) {
			content = content.replace( /define\(/, 'define("' + module + '",' );
		}
		content += "\r\n\r\n/*=======================================================*/\r\n";
		return content;
	},
	launch: function( name, distPath, modules, callback ) {
		var jsBuilder = this;

		function readBaseAMDQueryJS( next, result ) {
			if ( JSBuilder.amdqueryContent ) {
				next( null );
			} else {
				oye.readFile( jsBuilder.AMDQueryJSPath, function( content ) {
					JSBuilder.amdqueryContent = content;
					next( null );
				} );
			}
		}

		function buildjs( next ) {
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

				pathMap[ jsBuilder.AMDQueryJSPath ] = true;

				result.push( jsBuilder.editDefine( JSBuilder.amdqueryContent, "amdquery" ) );

				for ( i = 0; i < l; i++ ) {
					item = list[ i ];

					if ( !pathMap[ item.path ] ) {
						result.push( jsBuilder.editDefine( item.content, item.name ) );
						pathMap[ item.path ] = true;
					}
				}

				console.info( ( '\r\nthe defines "' + name + '" Dependencies length of file ' + result.length ).red );

				next( null, result, list );
			} );
		}

		function saveJSFile( contentList, moduleList, next ) {

			var readFileCallback = function( err ) {
				if ( err ) {
					console.error( err );
				}
			},
				content,
				minContent,
				defineConfig,
				path,
				deubugPath,
				minPath;

			exports.mkdirSync( distPath );

			console.log( '\r\nBegin write file'.red );

			len = contentList.length;
			name = name.replace( /^\/+/, '' );
			path = PATH.join( distPath, name.replace( /[^\/]*$/, '' ) );
			deubugPath = PATH.join( distPath, name + DebugJSSuffix );
			minPath = PATH.join( distPath, name + '.js' );

			content = contentList.join( "\r\n" );
			minContent = exports.minifyContent( content );

			if ( minContent ) {
				FSE.writeFile( minPath, minContent, readFileCallback );
				console.log( '\r\nSave file: ' + minPath );
			}

			FSE.writeFile( deubugPath, content, readFileCallback );
			console.log( '\r\nSave file: ' + deubugPath );

			next( null, moduleList, minPath, minContent, deubugPath, content );

		}

		async.waterfall( [ readBaseAMDQueryJS, buildjs, saveJSFile ], function( err, moduleList, minPath, minContent, deubugPath, content ) {
			if ( err ) {
				console.error( "[Error]".red, "JSBuilder:".red, err.red );
				return;
			}
			oye.setPath( jsBuilder.originOyeOpt );
			callback && callback( name, moduleList, minPath, minContent, deubugPath, content );
		} );

	}
};

exports.JSBuilder = JSBuilder;