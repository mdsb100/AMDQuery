aQuery.define( "hash/locationHash", [ "main/parse" ], function( $, parse ) {
	var str = window.location.hash.replace( "#", "" ),
		hash = parse.QueryString( str, "!", "=" );

	return hash;
} );