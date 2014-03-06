//Configure amdquery.js
exports.amdqueryPath = '../amdquery/';

//Configure project root path (server root)
exports.projectRootPath = '../';

//All build files will save to distPath
exports.distPath = 'dist/';

//mapping of path for AMD
exports.pathVariable = {

}

exports.debug = false;

exports.defines = {
	document: {
		path: "../document/assets/source/js/main.js",
		directory: [ "ui/" ],
		complete: function( moduleList, minPath, minContent, debugPath, debugContent ) {
			var FSE = require( 'fs-extra' );
			var path = "../document/assets/source/js/amdquery.js";
			FSE.writeFile( path, debugContent );
		}
	},
	jsdoc: {
		path: "../jsdoc/templates/amdquery/static/scripts/main.js",
		directory: [ "ui/" ],
		complete: function( moduleList, minPath, minContent, debugPath, debugContent ) {
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