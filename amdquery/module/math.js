aQuery.define( 'module/math', ["base/extend"], function( $, utilExtend, undefined ) {
  "use strict"; //启用严格模式
  var M = Math,
  pi = M.PI,
  martrix = function( a, b, c ) {
    this.init( a, b, c )
  },
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
  var math = {
    acceleration: function( distance, time ) {
      return ( distance + distance ) / ( time * time );
    },

    angle: function( x1, y1, x2, y2 ) {
      /// <summary>计算两点的斜率</summary>
      /// <param name="x1" type="Number">点1x坐标</param>
      /// <param name="y1" type="Number">点1y坐标</param>
      /// <param name="x2" type="Number">点2x坐标</param>
      /// <param name="y2" type="Number">点2y坐标</param>
      /// <returns type="Number" />
      return M.atan2( y2 - y1, x2 - x1 );
    },

    degreeToRadian: function( angle ) {
      /// <summary>角度转为弧度</summary>
      /// <param name="angle" type="Number">角度</param>
      /// <returns type="Number" />
      return pi * angle / 180;
    },

    direction: function( angle, range ) {
      /// <summary>确定返回的向量朝向。从x轴瞬时针起。时钟</summary>
      /// <param name="angle" type="Number">角度</param>
      /// <param name="range" type="Number">范围：0-15</param>
      /// <returns type="Number" />
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
    distance: function( x1, y1, x2, y2 ) {
      /// <summary>计算两点之间距离</summary>
      /// <param name="x1" type="Number">点1x坐标</param>
      /// <param name="y1" type="Number">点1y坐标</param>
      /// <param name="x2" type="Number">点2x坐标</param>
      /// <param name="y2" type="Number">点2y坐标</param>
      /// <returns type="Number" />
      return M.sqrt( M.pow( x1 - x2, 2 ) + M.pow( y1 - y2, 2 ) );
    },

    martrix: martrix,

    radianToDegree: function( angle ) {
      /// <summary>弧度转为角度</summary>
      /// <param name="angle" type="Number">弧度</param>
      /// <returns type="Number" />
      return angle * 180 / pi;
    },
    speed: function( distance, time ) {
      /// <summary>计算两点之间距离。单位：像素/毫秒</summary>
      /// <param name="distance" type="Number">距离</param>
      /// <param name="time" type="Number">时间</param>
      /// <returns type="Number" />
      return distance / time;
    }

  };

  utilExtend.easyExtend( martrix, {
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
    init: function( a, b, c ) {
      var ret = [ ];
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
          ret.push( [ ] );
          for ( j = 0; j < b; j++ ) {
            ret[ i ][ j ] = c ? c[ count++ ] : 0;
          }
        }
      }
      return ret;
    },
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
    subtraction: function( m1, m2 ) {
      return math.martrix.addition( m1, m2, true );
    }
  } );

  martrix.prototype = {
    addition: function( m ) {
      return new martrix( martrix.addition( this.martrix, m.martrix || m ) );
    },
    constructor: martrix,
    init: function( a, b, c ) {
      if ( a instanceof Array ) {
        this.martrix = a;
      } else {
        this.martrix = martrix.init( a, b, c );
      }
      return this;
    },
    multiply: function( m ) {
      return new martrix( martrix.multiply( this.martrix, m.martrix || m ) );
    },
    subtraction: function( m ) {
      return new martrix( martrix.subtraction( this.martrix, m.martrix || m ) );
    }
  };

  return math;

} );