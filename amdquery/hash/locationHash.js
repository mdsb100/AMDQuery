aQuery.define( "hash/locationHash", [ "main/parse" ], function( $, parse ) {
	this.describe( "Location to Hash" );
	var str = window.location.hash.replace( "#", "" ),
		hash = parse.QueryString( str, "!", "=" );

	return hash;
} );