//Configure amdquery.js
exports.amdqueryPath = '../amdquery/';

//Configure project root path
exports.projectRootPath = '../../';

//All build files will save to distPath
exports.distPath = 'dist/';

//mapping of path for AMD
exports.pathVariable = {

}

exports.debug = false;

//All apps entrance
exports.apps = [
	{
		name: "document",
		path: "../document/app.html",
		debug: false,
		complete: function( htmlInfo ) {

		},
		detectUIWidgetCSS: true,
		UIWidgetCSS: [],
		aQueryConfig: false,
		includeLibJSFromHead: true
  },
	{
		name: "test",
		path: "../test/app.html",
		debug: true,
		complete: function( htmlInfo ) {

		},
		detectUIWidgetCSS: true,
		UIWidgetCSS: [],
		aQueryConfig: false,
		includeLibJSFromHead: true,
		copyList: []
  }
 ]

exports.defines = {
	document: {
		path: "../document/assets/source/js/main.js",
		directory: [ "ui/" ],
		complete: function( minPath, minContent, debugPath, debugContent ) {
			var FSE = require( 'fs-extra' );
			var path = "../document/assets/source/js/amdquery.js";
			FSE.writeFile( path, debugContent );
		}
	},
	jsdoc: {
		path: "../jsdoc/templates/amdquery/static/scripts/main.js",
		directory: [ "ui/" ],
		complete: function( minPath, minContent, debugPath, debugContent ) {
			var FSE = require( 'fs-extra' );
			var path = "../jsdoc/templates/amdquery/static/scripts/amdquery.js";
			FSE.writeFile( path, debugContent );
		}
	}
}

//Compress configure of UglifyJS
exports.uglifyOptions = {
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
};

exports.cleanCssOptions = {
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
}