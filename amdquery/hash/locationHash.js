aQuery.define( "hash/locationHash", [ "main/parse" ], function( $, parse ) {
	this.describe( "Location to Hash" );
  /**
   * @pubilc
   * @module hash/locationHash
   * @describe window.location to hash
   * @example
   * // http://localhost:8080/document/app/asset/source/guide/AMDQuery.html#swapIndex=1!scrollTo=#Config
   * {
   *   swapIndex: "1",
   *   scrollTo:  "#Config"
   * }
   */
	var str = window.location.hash.replace( "#", "" ),
		hash = parse.QueryString( str, "!", "=" );

	return hash;
} );