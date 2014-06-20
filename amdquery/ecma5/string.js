aQuery.define( "ecma5/string", function( $, undefinded ) {
  "use strict";
  /**
   * Extend Function.prototype.trim
   * @pubilc
   * @module ecma5/string
   */
  this.describe( "ECMA String" );

  var obj = {
      trim: function() {
        return $.trim( this );
      }
    },
    i;
  for ( i in obj ) {
    if ( String.prototype[ i ] ) {
      ( String.prototype[ i ] = obj[ i ] );
    }
  }

  return String;

} );