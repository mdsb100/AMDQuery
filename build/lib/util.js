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