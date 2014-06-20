aQuery.define( "base/extend", [ "base/typed" ], function( $, typed ) {
  "use strict";
  this.describe( "Extend Util" );
  /**
   * @pubilc
   * @exports base/extend
   * @requires module:base/typed
   */
  var utilExtend = {
    /**
     * b extend a. Return object "a".
     * @param {Object}
     * @param {Object}
     * @returns {this}
     */
    easyExtend: function( a, b ) {
      for ( var i in b )
        a[ i ] = b[ i ];
      return this;
    },
    /**
     *
     * @param {Object|Boolean} - If parameter is true then recursion.
     * @param {...Object}
     * @returns {Object}
     * @example
     * var object1 = {
     *   apple: 0,
     *   banana: { weight: 52, price: 100 },
     *   cherry: 97
     * };
     * var object2 = {
     *   banana: { price: 200 },
     *   durian: 100
     * };
     * //Merge object2 into object1
     * $.extend( object1, object2 );
     * // output {"apple":0,"banana":{"price":200},"cherry":97,"durian":100}
     *
     * var object1 = {
     *   apple: 0,
     *   banana: { weight: 52, price: 100 },
     *   cherry: 97
     * };
     * var object2 = {
     *   banana: { price: 200 },
     *   durian: 100
     * };
     * // Merge object2 into object1, recursively
     * $.extend( true, object1, object2 );
     * // output {"apple":0,"banana":{"weight":52,"price":200},"cherry":97,"durian":100}
     *
     * var defaults = { validate: false, limit: 5, name: "foo" };
     * var options = { validate: true, name: "bar" };
     * // Merge defaults and options, without modifying defaults
     * var settings = $.extend( {}, defaults, options );
     * // defaults -- {"validate":false,"limit":5,"name":"foo"}
     * // options -- {"validate":true,"name":"bar"}
     * // settings -- {"validate":true,"limit":5,"name":"bar"}
     */
    extend: function( a ) {
      var target = arguments[ 0 ] || {},
        i = 1,
        length = arguments.length,
        deep = false,
        options, name, src, copy;

      if ( typed.isBoolean( target ) ) {
        deep = target;
        target = arguments[ 1 ] || {};
        i = 2;
      }

      if ( !typed.isObject( target ) && !typed.isFunction( target ) ) { //加了个array && !typed.isArray( target )
        target = {};
      }

      if ( length === i ) {
        target = this;
        --i;
      }

      for ( ; i < length; i++ ) {
        if ( ( options = arguments[ i ] ) != null ) {
          for ( name in options ) {
            if ( "hasOwnProperty" in options ? options.hasOwnProperty( name ) : true ) {
              src = target[ name ];
              copy = options[ name ];

              if ( target === copy ) {
                continue;
              }

              if ( deep && copy && ( typed.isPlainObject( copy ) || typed.isArray( copy ) ) ) {
                var clone = src && ( typed.isPlainObject( src ) || typed.isArray( src ) ) ? src : typed.isArray( copy ) ? [] : {};

                target[ name ] = utilExtend.extend( deep, clone, copy );

              } else if ( copy !== undefined ) {
                target[ name ] = copy;
              }
            }
          }
        }
      }

      return target;

    }
  };


  return utilExtend;
} );