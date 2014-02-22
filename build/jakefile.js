var path = require( "path" );
var FSE = require( 'fs-extra' );
var $amdquery = path.join( "..", "amdquery" )

task( "default", function() {
	jake.logger.log( "jake build[build_config.js]   build application and javascript" );
	jake.logger.log( "jake ui_css                   build css of UI-widget" );
	jake.logger.log( "jake jsdoc                    build javascript api document" );
} );

task( "build", {
	async: true
}, function( config ) {
	if ( !config ) {
		config = "build_config.js";
	}
	jake.logger.log( "build application and javascript ..." );

	jake.exec( "node build.js " + config, {
		printStdout: true
	}, complete );
} );

task( "ui_css", {
	async: true
}, function() {
	jake.logger.log( "build css of UI-widget ..." );

	jake.exec( "node buildWidgetUICSS.js", {
		printStdout: true
	}, complete );
} );

desc( "It is inner. Build js api document." );
task( "jsdoc", {
	async: true
}, function( template ) {
	var $distPath = path.join( "../document/app/assets/api/" );
	var $template = path.join( "..", "jsdoc", "templates", template || "docstrap" );
	if ( FSE.exists( $template ) ) {
		jake.logger.warn( $template + " does not exist" );
		complete();
		return;
	}
	jake.rmRf( $distPath );
	jake.logger.log( "Build jsdoc ..." );
	jake.exec( [ "jsdoc", $amdquery, path.join( $amdquery, "**", "*.js" ), "--template", $template, "--destination", $distPath ].join( " " ), {
		printStdout: true
	}, complete );
} );

desc( "It is inner. commit master." );
task( "master", [ "jsdoc", "build" ], {
	async: true
}, function( a ) {
	jake.exec(
    [
    "git stash",
    "git checkout master",
    "git stash pop"
    "git commit -am 'Publish gh-pages'"
    ], {
			printStdout: true
		}, complete );
} );

desc( "It is inner. Publish gh-pages." );
task( "pages", [ "master" ], {
	async: true
}, function( a ) {
	jake.exec(
	   [
	   "git checkout gh-pages",
	   "git merge master",
	   "git push origin gh-pages",
	   "git checkout master"
	   ], {
			printStdout: true
		}, complete );
	complete()
} );