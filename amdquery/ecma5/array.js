aQuery.define( "ecma5/array", [ "base/array" ], function( $, array ) {
  "use strict";
  this.describe( "ECMA Array" );

  /**
   * @callback arrayCallback
   * @param {*} item - Element of array.
   * @param {Number} index - Index of element.
   * @param {Array} array
   * @returns {Boolean|*}
   */

  /**
   * @describe .
   * @callback arrayReduceCallback
   * @param {*} rv - Previous result.
   * @param {*} item - Element of array.
   * @param {Number} index - Index of element.
   * @param {Array} array
   * @returns {Boolean|*}
   */

  /**
   * Extend Array.prototype if the context not support ecma5.
   * @pubilc
   * @requires module:base/array
   * @exports ecma5/array
   * @borrows module:base/array.filterArray as filter
   * @borrows module:base/array.inArray as indexOf
   * @borrows module:base/array.lastInArray as lastIndexOf
   */
  var uitl = {
    /**
     * Iterate each item, if item do not conform to some condition then return false else return true.
     * @param {arrayCallback} fn - Callback.
     * @param {Object} [context] - Context of callback.
     * @returns {Boolean}
     */
    every: function( fn, context ) {
      var t = this,
        ret = true;

      this.forEach( function( item, index ) {
        if ( fn.call( context, item, index, this ) !== true ) {
          ret = false;
          return false;
        }
      }, t );
      return ret;
    },
    /**
     * Iterate each item, if the return value is false then break.
     * @param {arrayCallback} fn - Callback.
     * @param {Object} [context] - Context of callback.
     * @returns {this}
     */
    forEach: function( fn, context ) {
      for ( var i = 0, len = this.length; i < len; i++ ) {
        if ( i in this && fn.call( context, this[ i ], i, this ) === false ) {
          break;
        }

      }
      return this;
    },
    filter: function( fn, context ) {
      return array.filterArray( this, fn, context );
    },

    indexOf: function( item, index ) {
      return array.inArray( this, item, index );
    },

    lastIndexOf: function( item, index ) {
      return array.lastInArray( this, item, index );
    },
    /**
     * Iterate each item, and return new.
     * @param {arrayCallback} fn - Callback.
     * @param {Object} [context] - Context of callback.
     * @returns {Array} - A new array.
     */
    map: function( fn, context ) {
      var t = this,
        len = t.length;
      var ret = new Array( len );
      for ( var i = 0; i < len; i++ ) {
        if ( i in t ) {
          ret[ i ] = fn.call( context, t[ i ], i, t );
        }
      }
      return ret;
    },
    /**
     * Iterate each item, and return lastest.
     * @param {arrayReduceCallback} fn - Callback.
     * @param {*} [initialValue] - Initial value.
     * @returns {*} - Lastest result.
     */
    reduce: function( fn, initialValue ) {
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
        if ( i in t ) rv = fn.call( null, rv, t[ i ], i, t );
      }

      return rv;
    },
    /**
     * Iterate each item by descending, and return lastest.
     * @param {arrayReduceCallback} fn - Callback.
     * @param {*} [initialValue] - Initial value.
     * @returns {*} - Lastest result.
     */
    reduceRight: function( fn, initialValue ) {
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
        if ( i in t ) rv = fn.call( null, rv, t[ i ], i, t );
        i--;
      }

      return rv;
    },
    /**
     * Iterate each item, if item conform to some condition then return true else return false.
     * @param {arrayCallback} fn - Callback.
     * @param {Object} [context] - Context of callback.
     * @returns {Boolean}
     */
    some: function( fn, context ) {
      var ret = false;
      this.forEach( function( item, index ) {
        if ( fn.call( context, item, index, this ) === true ) {
          ret = true;
          return false;
        }
      }, this );
      return ret;
    }
  };

  for ( var name in uitl ) {
    if ( !Array.prototype[ name ] ) {
      Array.prototype[ name ] = uitl[ name ];
    }
  }

  return uitl;

} );