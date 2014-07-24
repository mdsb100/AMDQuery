aQuery.define( "module/martrix", [ "main/object" ], function( $, object ) {
  /**
   * @constructor
   * @exports module/martrix
   * @requires module:main/object
   * @mixes ObjectClassStaticMethods
   */
  var martrix = object.extend( "martrix", /** @lends module:module/martrix.prototype */ {
    /**
     * Martrix addition anthoer.
     * @param martrix {module:module/martrix}
     * @returns {module:module/martrix}
     */
    addition: function( m ) {
      return new martrix( martrix.addition( this.martrix, m.martrix || m ) );
    },
    /**
     * Init martrix by an array.
     * @constructs module:module/martrix
     * @param a {Array<Array<Number>>|Number} - An array of martrix or width of martrix.
     * @param {Number} [b] - Height of martrix.
     * @param {Array<Number>} [c] - An array.
     * @returns {this}
     */
    init: function( a, b, c ) {
      if ( a instanceof Array ) {
        this.martrix = a;
      } else {
        this.martrix = martrix.init( a, b, c );
      }
      return this;
    },
    /**
     * Martrix multiply anthoer.
     * @param martrix {module:module/martrix}
     * @returns {module:module/martrix}
     */
    multiply: function( m ) {
      return new martrix( martrix.multiply( this.martrix, m.martrix || m ) );
    },
    /**
     * Martrix subtraction anthoer.
     * @param martrix {module:module/martrix}
     * @returns {module:module/martrix}
     */
    subtraction: function( m ) {
      return new martrix( martrix.subtraction( this.martrix, m.martrix || m ) );
    }
  }, /** @lends module:module/martrix */ {
    /**
     * Martrix addition martrix.
     * @param martrix {Array<Array<Number>>}
     * @param martrix {Array<Array<Number>>}
     * @returns {Array<Array<Number>>}
     */
    addition: function( m1, m2 ) {
      var
        r1 = m1.length,
        c1 = m1[ 0 ].length,
        ret = martrix.init( m1.length, m1[ 0 ].length ),
        s = arguments[ 2 ] ? -1 : 1,
        x, y;
      if ( typeof m2 == "number" ) {
        for ( x = 0; x < r1; x++ ) {
          for ( y = 0; y < c1; y++ ) {
            ret[ x ][ y ] = m1[ x ][ y ] + m2 * s;
          }
        }
      } else {
        if ( r1 != m2.length || c1 != m2[ 0 ].length ) {
          return;
        }
        for ( x = 0; x < r1; x++ ) {
          for ( y = 0; y < c1; y++ ) {
            ret[ x ][ y ] += m2[ x ][ y ] * s;
          }
        }
      }
      return ret;
    },
    /**
     * Init martrix by an array.
     * @param a {Array<Array<Number>>|Number} - An array of martrix or width of martrix.
     * @param {Number} [b] - Height of martrix.
     * @param {Array<Number>} [c] - An array.
     * @returns {Array<Array<Number>>}
     */
    init: function( a, b, c ) {
      var ret = [];
      if ( !a || !b ) {
        ret = [
          [ 1, 0, 0, 0 ],
          [ 0, 1, 0, 0 ],
          [ 0, 0, 1, 0 ],
          [ 0, 0, 0, 1 ]
        ];
      } else {
        if ( c && a * b != c.length ) {
          return ret;
        }
        for ( var i = 0, j = 0, count = 0; i < a; i++ ) {
          ret.push( [] );
          for ( j = 0; j < b; j++ ) {
            ret[ i ][ j ] = c ? c[ count++ ] : 0;
          }
        }
      }
      return ret;
    },
    /**
     * Martrix multiply martrix.
     * @param martrix {Array<Array<Number>>}
     * @param martrix {Array<Array<Number>>}
     * @returns {Array<Array<Number>>}
     */
    multiply: function( m1, m2 ) {
      var r1 = m1.length,
        c1 = m1[ 0 ].length,
        ret, x, y, z;
      if ( typeof m2 == "number" ) {
        ret = martrix.init( r1, c1 );
        for ( x = 0; x < r1; x++ ) {
          for ( y = 0; y < c1; y++ ) {
            ret[ x ][ y ] = m1[ x ][ y ] * m2;
          }
        }
      } else {
        var r2 = m2.length,
          c2 = m2[ 0 ].length,
          sum = 0;
        ret = math.martrix.init( r1, c2 );
        if ( c1 != r2 ) {
          return;
        }
        for ( x = 0; x < c2; x++ ) {
          for ( y = 0; y < r1; y++ ) {
            sum = 0;
            for ( z = 0; z < c1; z++ ) {
              sum += m1[ y ][ z ] * m2[ z ][ x ];
            }
            ret[ y ][ x ] = sum;
          }
        }
      }
      return ret;
    },
    /**
     * Martrix subtraction martrix.
     * @param martrix {Array<Array<Number>>}
     * @param martrix {Array<Array<Number>>}
     * @returns {Array<Array<Number>>}
     */
    subtraction: function( m1, m2 ) {
      return math.martrix.addition( m1, m2, true );
    }
  } );

  return martrix;
} );