var glob = require( "glob" );
var beautify_html = require( 'js-beautify' ).html;
var beautify_css = require( 'js-beautify' ).css;
var _ = require( 'underscore' );
var FSE = require( 'fs-extra' );
var PATH = require( 'path' );
var cwd = "../";
var globOpt = {
	cwd: cwd
};

// https://github.com/einars/js-beautify
// Please modify option directly

function beautify( pattern, ignorePatternList, toDo, opt ) {
	list = glob.sync( pattern, globOpt );
	ignore = [];

	_.forEach( ignorePatternList, function( ignorePattern ) {
		ignore = ignore.concat( glob.sync( ignorePattern + pattern, globOpt ) );
	} );

	_.forEach( ignore, function( path ) {
		var index = list.indexOf( path )
		if ( index > -1 ) {
			list.splice( index, 1 );
		}
	} );

	_.forEach( list, function( path ) {
		console.log( path );
		FSE.writeFile( cwd + path, toDo( FSE.readFileSync( cwd + path ).toString(), opt || {} ) );
	} );
}

beautify( "**/*.css", [ "build/", "jsdoc/", "document/api" ], beautify_css )
beautify( "**/*.xml", [ "build/", "jsdoc/", "document/api" ], beautify_html )
beautify( "**/*.html", [ "build/", "jsdoc/", "document/api" ], beautify_html )