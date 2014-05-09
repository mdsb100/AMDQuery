var util = require( './../lib/util.js' );

var _ = require( "underscore" );

var PATH = require( 'path' );

var FSE = require( 'fs-extra' );

var argvs = process.argv;

var buildFileRootPath = PATH.dirname( process.argv[ 1 ] );

var appRelativePath = process.argv[ 2 ];

var templateName = process.argv[ 3 ];

templateName = templateName || "default";

var templatePath = PATH.join( buildFileRootPath, "templates", templateName );

if ( !appRelativePath ) {
	console.error( "Second parameter must exists.", "'jake createapp[../myapp]'" );
	process.exit( 1 );
}

var amdqueryProjectPath = PATH.join( buildFileRootPath, "../.." );

var amdqueryJSPath = PATH.join( amdqueryProjectPath, "amdquery", "amdquery.js" );

var appPath = PATH.join( amdqueryProjectPath, appRelativePath );

if ( !FSE.existsSync( appPath ) ) {
	util.mkdirSync( appPath );
}

// var globalPath = PATH.join( appPath, "global" );

// if ( !FSE.existsSync( globalPath ) ) {
// 	FSE.copySync( PATH.join( amdqueryProjectPath, "global" ), globalPath );
// }

var children = FSE.readdirSync( templatePath );
for ( var i = children.length - 1, child; i >= 0; i-- ) {
	child = children[ i ];
	FSE.copySync( PATH.join( templatePath, child ), PATH.join( appPath, child ) );
}

var DOMParser = require( 'xmldom' ).DOMParser;

appHTMLPath = PATH.join( appPath, "app.html" );

var htmlString = FSE.readFileSync( appHTMLPath );

var doc = new DOMParser().parseFromString( htmlString.toString(), 'text/html' );

var head = doc.documentElement.getElementsByTagName( "head" )[ 0 ];

var scripts = head.getElementsByTagName( "script" ),
	script;

for ( i = 0, len = scripts.length; i < len; i++ ) {
	script = scripts[ i ];
	if ( script.hasAttribute( "app" ) ) {
		break;
	}
}

var appAttrConfig = splitAttrToObject( script.getAttribute( "app" ) );

appAttrConfig.src = PATH.join( PATH.relative( amdqueryJSPath, appPath ), "app" );

script.setAttribute( "src", PATH.relative( appPath, amdqueryJSPath ) );

script.setAttribute( "app", formatToAttr( appAttrConfig ) );

FSE.writeFileSync( appHTMLPath, doc.toString() );

function splitAttrToObject( str ) {
	var result = {}, j = 0,
		attrs = str.split( /;|,/ ),
		attr;
	for ( ; attr = attrs[ j++ ]; ) {
		attr = attr.split( /:|=/ );
		if ( attr[ 1 ] ) {
			// attr[ 1 ].match( /false|true|1|0/ ) && ( attr[ 1 ] = eval( attr[ 1 ] ) );
			result[ attr[ 0 ] ] = attr[ 1 ];
		}
	}
	return result;
}

function formatToAttr( object ) {
	var result = "",
		key, value;
	for ( key in object ) {
		value = object[ key ];
		result += key + ":" + value + ";";
	}

	return result;
}