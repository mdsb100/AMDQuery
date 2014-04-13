aQuery.define( "base/array", [ "base/typed", "base/extend" ], function( $, typed, extend ) {
	"use strict";
	this.describe( "Array Util" );

	var
	indexOf = Array.prototype.indexOf || function( item, i ) {
		var len = this.length;
		i = i || 0;
		if ( i < 0 ) i += len;
		for ( ; i < len; i++ )
			if ( i in this && this[ i ] === item ) return i;
		return -1;
	}, lastIndexOf = Array.prototype.lastIndexOf || function( item, i ) {
		var len = this.length - 1;
		i = i || len;
		if ( i < 0 ) i += len;
		for ( ; i > -1; i-- )
			if ( i in this && this[ i ] === item ) break;
		return i;
	}, push = Array.prototype.push;

	/**
	 * @callback grepCallback
	 * @param {*} - Item.
	 * @param {Number} - Index.
	 * @returns {Boolean}
	 */

	/**
	 * This callback context is parameter of filterArray.
	 * @this {Object}
	 * @callback filterArrayCallback
	 * @param {*} - Item
	 * @param {Number} - Index
	 * @param {Array}
	 * @returns {Boolean}
	 */

	/**
	 * @pubilc
	 * @exports base/array
	 * @requires module:base/typed
	 * @requires module:base/extend
	 */
	var array = {
		/**
		 * Filter Array
		 * @param {Array}
		 * @param {grepCallback}
		 * @param {Boolean} [inv=false] - If inv !== grepCallback() then push.
		 * @param {Array}
		 */
		grep: function( arr, callback, inv ) {
			var retVal,
				ret = [],
				i = 0,
				length = arr.length;
			inv = !! inv;

			// Go through the array, only saving the items
			// that pass the validator function
			for ( ; i < length; i++ ) {
				retVal = !! callback( arr[ i ], i );
				if ( inv !== retVal ) {
					ret.push( arr[ i ] );
				}
			}

			return ret;
		},
		/**
		 * Filter Array. If callback return true then push.
		 * @param {Array}
		 * @param {filterArrayCallback}
		 * @param {Object} [context=item] - filterArrayCallback context. If null then is each item.
		 * @returns {Array}
		 */
		filterArray: function( arr, callback, context ) {
			var ret = [];
			for ( var i = 0, len = arr.length, item; i < len; i++ ) {
				item = arr[ i ];
				callback.call( context || item, item, i, arr ) === true && ret.push( item );
			}
			return ret;
		},
		/**
		 * Excluding the same element in the array
		 * @param {Array}
		 * @returns {Array}
		 */
		filterSame: function( arr ) {
			if ( arr.length > 1 ) {
				for ( var len = arr.length, list = [ arr[ 0 ] ], result = true, i = 1, j = 0; i < len; i++ ) {
					j = 0;
					for ( ; j < list.length; j++ ) {
						if ( arr[ i ] === list[ j ] ) {
							result = false;
							break;
						}
					}
					result && list.push( arr[ i ] );
					result = true;
				}
				return list;
			} else {
				return arr;
			}
		},
		/**
		 * Search the index of elements in the array. -1 means not found.
		 * @param {Array}
		 * @param {*}
		 * @param {Number} [i=0] - Starting Index.
		 * @returns {Number}
		 */
		inArray: function( arr, item, i ) {
			return indexOf.call( arr, item, i );
		},
		/**
		 * Search the index of elements in the array by descending. -1 means not found.
		 * @param {Array}
		 * @param {*}
		 * @param {Number} [i=arr.length-1] - Starting Index.
		 * @returns {Array}
		 */
		lastInArray: function( arr, item, i ) {
			return lastIndexOf.call( arr, item, i );
		},
		/**
		 * Make array.
		 * @param {Array}
		 * @param {Array} [results=Array]
		 * @returns {Array}
		 */
		makeArray: function( array, results ) {
			var result = results || [];

			if ( array ) {
				if ( typed.isNul( array.length ) || typed.isString( array ) || typed.isFunction( array ) || array.setInterval ) {
					push.call( result, array );
				} else {
					result = array.toArray( array );
				}
			}

			return result;
		},
		/**
		 * Some object which has length change to array.
		 * @param {*} - Not a function but has length.
		 * @param {Number} [start=0]
		 * @param {Number} [end=obj.length]
		 * @returns {Array}
		 */
		toArray: function( obj, start, end ) {
			var i = 0,
				list = [],
				len = obj.length;
			if ( !( typed.isNumber( len ) && typed.isFunction( obj ) ) ) {
				for ( var value = obj[ 0 ]; i < len; value = obj[ ++i ] ) {
					list.push( value );
				}
			}
			return list.slice( startIndex || 0, num2 || len );

		}
	};

	return array;
} );