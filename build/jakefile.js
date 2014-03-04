var path = require( "path" );
var FSE = require( 'fs-extra' );
var $amdquery = path.join( "..", "amdquery" )

task( "default", function() {
	jake.logger.log( "jake build[*.js(config file)]                build application and javascript" );
	jake.logger.log( "jake build                                   default is build_config.js" );
	jake.logger.log( "jake jsdoc[default|amdquery(template name)]  build javascript api document" );
	jake.logger.log( "jake jsdoc                                   default is amdquery" );
	jake.logger.log( "jake ui_css                                  build css of widget-ui" );
	jake.logger.log( "jake beautify[...file]                       example 'jake beautify[a.html,b.css,c.xml,d.js]'" );
} );

task( "build", {
	async: true
}, function( config ) {
	if ( !config ) {
		config = "build_config.js";
	}
	jake.logger.log( "build application and javascript ..." );

	jake.exec( "node build.js " + config, {
		printStdout: true,
		printStderr: true
	}, complete );
} );

task( "ui_css", {
	async: true
}, function() {
	jake.logger.log( "build css of widget-ui ..." );

	jake.exec( "node buildWidgetUICSS.js", {
		printStdout: true,
		printStderr: true
	}, complete );
} );

task( "beautify", {
	async: true
}, function() {
	jake.logger.log( "Beautify files ..." );
	var arg = [].slice.call( arguments, 0, arguments.length );
	jake.exec( "node beautify.js " + ( arg.length ? arg.join( " " ) : "" ), {
		printStdout: true,
		printStderr: true
	}, complete );
} );

desc( "It is inner. Build js api document." );
task( "jsdoc", {
	async: true
}, function( opt ) {
	var defTemplate = "amdquery";
	opt = opt || defTemplate;
	var $distPath = path.join( "../document/assets/api" );
	var $template = path.join( "..", "jsdoc", "templates", opt );
	var $apinavXMLName = "apinav.xml";
	var $apinavXMLPath = path.join( $template, "build", $apinavXMLName );
	var command = [ [ "jsdoc", $amdquery, path.join( $amdquery, "**", "*.js" ), "--template", $template, "--destination", $distPath ].join( " " ) ];
	var callback = complete;
	if ( FSE.exists( $template ) ) {
		jake.logger.warn( $template + " does not exist" );
		complete();
		return;
	}

	jake.rmRf( $distPath );
	jake.logger.log( "Build jsdoc ..." );

	if ( opt == defTemplate ) {
		command.push( [ "jake beautify[" + $apinavXMLPath + "]" ] );
		callback = function() {
			var toPath = path.join( "../document/xml", $apinavXMLName );
			jake.cpR( $apinavXMLPath, toPath );
			complete();
		}
	}

	jake.exec( command, {
		printStdout: true,
		printStderr: true
	}, callback );

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
    ], {
			printStdout: true,
			printStderr: true
		}, complete );
} );

desc( "It is inner. Publish gh-pages." );
task( "pages", {
	async: true
}, function( msg ) {
	jake.exec(
    [
    "git checkout gh-pages",
    "git merge master",
    "git push origin gh-pages",
    "git checkout master"
    ], {
			printStdout: true,
			printStderr: true
		}, complete );
	complete()
} );