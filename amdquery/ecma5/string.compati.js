aQuery.define( "ecma5/string.compati", function( $, undefinded ) {
	"use strict"; //启用严格模式
  this.describe( "ECMA String" );
	var obj = {
		trim: function() {
			return this.replace( /(^\s*)|(\s*$)/g, "" );
		}
	}, i;
	for ( i in obj ) {
		if ( String.prototype[ i ] ) {
			( String.prototype[ i ] = obj[ i ] );
		}
	}

	return String;

} );