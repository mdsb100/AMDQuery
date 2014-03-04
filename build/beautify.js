var beautify_js = require( 'js-beautify' );
var beautify_html = require( 'js-beautify' ).html;
var beautify_css = require( 'js-beautify' ).css;
var FSE = require( 'fs-extra' );
var PATH = require( 'path' );
var _ = require( 'underscore' );
var buildPath = PATH.dirname( process.argv[ 1 ] );
var option = {
	indent_size: 2
};
exports.setOption = function( opt ) {
	_.extend( option, opt );
}

exports.beautify = function() {
	var i = 0,
		arg = arguments,
		len = arg.length,
		content = "",
		filePath;

	for ( ; i < len; i++ ) {
		filePath = PATH.join( buildPath, arg[ i ] );
		if ( FSE.existsSync( filePath ) ) {
			content = FSE.readFileSync( filePath ).toString();
			console.log( "Beautify", filePath );
			switch ( PATH.extname( filePath ) ) {
				case ".js":
					content = beautify_js( content, option );
					break;
				case ".css":
					content = beautify_css( content, option );
					break;
				case ".xml":
				case ".html":
					content = beautify_html( content, option );
					break;
			}
			console.log( "Rewrite", filePath );
			FSE.writeFileSync( filePath, content );
		}
	}
}

if ( PATH.basename( process.argv[ 1 ] ) === "beautify.js" && process.argv.length > 1 ) {
	var argv = process.argv.splice( 2 );
	exports.beautify.apply( null, argv );
}