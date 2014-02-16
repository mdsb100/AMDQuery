var buildFileRootPath = process.argv[ 1 ].replace( /([\\\/])[^\\\/]*$/, '$1' );
var FSE = require( 'fs-extra' );
var PATH = require( 'path' );
var glob = require( "glob" );
var AMDQueryJSRootPath = PATH.join( buildFileRootPath, '../amdquery/' );
var
cwd = PATH.join( AMDQueryJSRootPath, "ui", "css" ),
	globOpt = {
		cwd: cwd
	};

var cleanCssOptions = {
	//* for keeping all (default), 1 for keeping first one only, 0 for removing all
	keepSpecialComments: "*",
	//whether to keep line breaks (default is false)
	keepBreaks: false,
	//whether to process @import rules
	processImport: true,
	//whether to skip URLs rebasing
	noRebase: false,
	//set to true to disable advanced optimizations - selector & property merging, reduction, etc.
	noAdvanced: false,
	//ie8 for IE8 compatibility mode, * for merging all (default)
	selectorsMergeMode: "*"
};

function buildUICss( cwd ) {
	var cssFileList = glob.sync( "*.css", globOpt );

	var uiCombinationCssPath = PATH.join( AMDQueryJSRootPath, "ui", "css", "widget-ui.css" );

	_buildCssAndSave( cssFileList, uiCombinationCssPath, cwd );

	console.log( '\r\nSave UI amdquery-widget.css: ', uiCombinationCssPath );
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
	var minimized = new CleanCSS( cleanCssOptions )
		.minify( cssTxt );

	FSE.writeFileSync( dist, minimized.toString() );

	return dist;
}

buildUICss( cwd );