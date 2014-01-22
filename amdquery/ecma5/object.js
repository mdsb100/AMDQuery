define( "ecma5/objcet", function() {
	"use strict";
  /**
   * Extend Object.prototype
   * @pubilc
   * @module ecma5/object
   */

  this.describe( "ECMA Object" );

	var fun = function() {}, obj = {
			getPrototypeOf: fun,
			getOwnPropertyDescriptor: fun,
			getOwnPropertyNames: fun,
			create: fun,
			defineProperty: fun,
			defineProperties: fun,
			seal: fun,
			freeze: fun,
			preventExtensions: fun,
			isSealed: fun,
			isFrozen: fun,
			isExtensible: fun,
			keys: fun
		};

	for ( var i in obj ) {
		if ( !Object.prototype[ i ] ) {
			Object.prototype[ i ] = obj[ i ];
		}
	}

	return Object;

} );