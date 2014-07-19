aQuery.define( "module/math", [], function( $ ) {
  "use strict";
  var M = Math,
    pi = M.PI,
    directionHash = {
      0: 3,
      1: 4,
      2: 5,
      3: 6,
      4: 7,
      5: 8,
      6: 9,
      7: 10,
      8: 11,
      9: 12,
      10: 1,
      11: 2
    };
  /**
   * @pubilc
   * @exports module/math
   */
  var math = {
    /**
     * Get acceleration.
     * @param {Number}
     * @param {Number}
     * @returns {Number}
     */
    acceleration: function( distance, time ) {
      return ( distance + distance ) / ( time * time );
    },
    /**
     * Get angle by 2 point.
     * @param {Number}
     * @param {Number}
     * @param {Number}
     * @param {Number}
     * @returns {Number}
     */
    angle: function( x1, y1, x2, y2 ) {
      return M.atan2( y2 - y1, x2 - x1 );
    },
    /**
     * @param {Number}
     * @returns {Number}
     */
    degreeToRadian: function( angle ) {
      return pi * angle / 180;
    },
    /**
     * Get angle by 2 point.
     * @param {Number}
     * @param {Number} [rang=15] - A range of angle.
     * @returns {Number}
     */
    direction: function( angle, range ) {
      var result = 9;
      range = $.between( 0, 15, range || 15 );
      if ( 0 - range < angle && angle <= value + range ) {

      }
      for ( var i = 0, value; i <= 11; i++ ) {
        if ( i < 6 ) {
          value = i * 30;
        } else if ( i >= 6 ) {
          value = ( i % 6 * 30 ) - 180;
        }
        if ( value - range < angle && angle <= value + range ) {
          result = directionHash[ i ];
          break;
        }

      }
      return result;
    },
    /**
     * Get distance by 2 point.
     * @param {Number}
     * @param {Number}
     * @param {Number}
     * @param {Number}
     * @returns {Number}
     */
    distance: function( x1, y1, x2, y2 ) {
      return M.sqrt( M.pow( x1 - x2, 2 ) + M.pow( y1 - y2, 2 ) );
    },

    /**
     * @param {Number}
     * @returns {Number}
     */
    radianToDegree: function( angle ) {
      return angle * 180 / pi;
    },
    /**
     * @param {Number}
     * @param {Number}
     * @returns {Number}
     */
    speed: function( distance, time ) {
      return distance / time;
    }

  };

  return math;

} );