aQuery.define( "ecma5/array.compati", [ "base/array" ], function( $, array ) {
	"use strict"; //启用严格模式
  this.describe( "ECMA Array" );
	var name, obj = {
			every: function( fun, context ) {
				var t = this,
					ret = true;

				this.forEach( function( item, index ) {
					if ( fun.call( context, item, index, this ) !== true ) {
						ret = false;
						return false;
					}
				}, t );
				return ret;
			},

			forEach: function( fun, context ) {
				for ( var i = 0, len = this.length; i < len; i++ ) {
					if ( i in this && fun.call( context, this[ i ], i, this ) === false ) {
						break;
					}

				}
				return this;
			},
			filter: function( fun, context ) {
				return array.filterArray( this, fun, context );
			},

			indexOf: function( item, index ) {
				return array.inArray( this, item, index );
			},


			lastIndexOf: function( item, index ) {
				return array.lastInArray( this, item, index );
			},

			map: function( fun, context ) {
				var t = this,
					len = t.length;
				var ret = new Array( len ); //区别在于这里，forEach不会生成新的数组
				for ( var i = 0; i < len; i++ ) {
					if ( i in t ) {
						ret[ i ] = fun.call( context, t[ i ], i, t );
					}
				}
				return ret;
			},

			reduce: function( fun, initialValue ) {
				var t = this,
					len = t.length,
					i = 0,
					rv;
				if ( initialValue ) {
					rv = initialValue;
				} else {
					do {
						if ( i in t ) {
							rv = t[ i++ ];
							break;
						}
						if ( ++i >= len ) throw new Error( "array contains no values, no initial value to return" );
					}
					while ( true );
				}

				for ( ; i < len; i++ ) {
					if ( i in t ) rv = fun.call( null, rv, t[ i ], i, t );
				}

				return rv;
			},

			reduceRight: function( fun, initialValue ) {
				var
				t = this,
					len = t.length,
					i = len - 1,
					rv;
				if ( initialValue ) {
					rv = initialValue;
				} else {
					do {
						if ( i in t ) {
							rv = t[ i-- ];
							break;
						}
						if ( --i < 0 ) throw new Error( "array contains no values, no initial value to return" );
					}
					while ( true );
				}

				while ( i >= 0 ) {
					if ( i in t ) rv = fun.call( null, rv, t[ i ], i, t );
					i--;
				}

				return rv;
			},

			some: function( fun, context ) {
				var ret = false;
				this.forEach( function( item, index ) {
					if ( fun.call( context, item, index, this ) === true ) {
						ret = true;
						return false;
					}
				}, this );
				return ret;
			}
		};

	for ( name in obj ) {
		if ( !Array.prototype[ name ] ) {
			Array.prototype[ name ] = obj[ name ];
		}
	}

	return Array;

} );