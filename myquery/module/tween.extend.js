myQuery.define( "module/tween.extend", [ "module/tween" ], function( $, tween, undefined ) {
  "use strict"; //启用严格模式
  var math = Math;
  $.easyExtend( tween, {
    quad: {
      easeIn: function( t, b, c, d ) {
        return c * ( t /= d ) * t + b;
      },
      easeOut: function( t, b, c, d ) {
        return -c * ( t /= d ) * ( t - 2 ) + b;
      },
      easeInOut: function( t, b, c, d ) {
        if ( ( t /= d / 2 ) < 1 ) return c / 2 * t * t + b;
        return -c / 2 * ( ( --t ) * ( t - 2 ) - 1 ) + b;
      }
    },
    cubic: {
      easeIn: function( t, b, c, d ) {
        return c * ( t /= d ) * t * t + b;
      },
      easeOut: function( t, b, c, d ) {
        return c * ( ( t = t / d - 1 ) * t * t + 1 ) + b;
      },
      easeInOut: function( t, b, c, d ) {
        if ( ( t /= d / 2 ) < 1 ) return c / 2 * t * t * t + b;
        return c / 2 * ( ( t -= 2 ) * t * t + 2 ) + b;
      }
    },
    quart: {
      easeIn: function( t, b, c, d ) {
        return c * ( t /= d ) * t * t * t + b;
      },
      easeOut: function( t, b, c, d ) {
        return -c * ( ( t = t / d - 1 ) * t * t * t - 1 ) + b;
      },
      easeInOut: function( t, b, c, d ) {
        if ( ( t /= d / 2 ) < 1 ) return c / 2 * t * t * t * t + b;
        return -c / 2 * ( ( t -= 2 ) * t * t * t - 2 ) + b;
      }
    },
    quint: {
      easeIn: function( t, b, c, d ) {
        return c * ( t /= d ) * t * t * t * t + b;
      },
      easeOut: function( t, b, c, d ) {
        return c * ( ( t = t / d - 1 ) * t * t * t * t + 1 ) + b;
      },
      easeInOut: function( t, b, c, d ) {
        if ( ( t /= d / 2 ) < 1 ) return c / 2 * t * t * t * t * t + b;
        return c / 2 * ( ( t -= 2 ) * t * t * t * t + 2 ) + b;
      }
    },
    sine: {
      easeIn: function( t, b, c, d ) {
        return -c * math.cos( t / d * ( math.PI / 2 ) ) + c + b;
      },
      easeOut: function( t, b, c, d ) {
        return c * math.sin( t / d * ( math.PI / 2 ) ) + b;
      },
      easeInOut: function( t, b, c, d ) {
        return -c / 2 * ( math.cos( math.PI * t / d ) - 1 ) + b;
      }
    },
    expo: {
      easeIn: function( t, b, c, d ) {
        return ( t == 0 ) ? b : c * math.pow( 2, 10 * ( t / d - 1 ) ) + b;
      },
      easeOut: function( t, b, c, d ) {
        return ( t == d ) ? b + c : c * ( -math.pow( 2, -10 * t / d ) + 1 ) + b;
      },
      easeInOut: function( t, b, c, d ) {
        if ( t == 0 ) return b;
        if ( t == d ) return b + c;
        if ( ( t /= d / 2 ) < 1 ) return c / 2 * math.pow( 2, 10 * ( t - 1 ) ) + b;
        return c / 2 * ( -math.pow( 2, -10 * --t ) + 2 ) + b;
      }
    },
    circ: {
      easeIn: function( t, b, c, d ) {
        return -c * ( math.sqrt( 1 - ( t /= d ) * t ) - 1 ) + b;
      },
      easeOut: function( t, b, c, d ) {
        return c * math.sqrt( 1 - ( t = t / d - 1 ) * t ) + b;
      },
      easeInOut: function( t, b, c, d ) {
        if ( ( t /= d / 2 ) < 1 ) return -c / 2 * ( math.sqrt( 1 - t * t ) - 1 ) + b;
        return c / 2 * ( math.sqrt( 1 - ( t -= 2 ) * t ) + 1 ) + b;
      }
    },
    elastic: {
      easeIn: function( t, b, c, d, a, p ) {
        if ( t == 0 ) return b;
        if ( ( t /= d ) == 1 ) return b + c;
        if ( !p ) p = d * .3;
        if ( !a || a < math.abs( c ) ) {
          a = c;
          var s = p / 4;
        } else {
          var s = p / ( 2 * math.PI ) * math.asin( c / a );
        }
        return -( a * math.pow( 2, 10 * ( t -= 1 ) ) * math.sin( ( t * d - s ) * ( 2 * math.PI ) / p ) ) + b;
      },
      easeOut: function( t, b, c, d, a, p ) {
        if ( t == 0 ) return b;
        if ( ( t /= d ) == 1 ) return b + c;
        if ( !p ) p = d * .3;
        if ( !a || a < math.abs( c ) ) {
          a = c;
          var s = p / 4;
        } else {
          var s = p / ( 2 * math.PI ) * math.asin( c / a );
        }
        return ( a * math.pow( 2, -10 * t ) * math.sin( ( t * d - s ) * ( 2 * math.PI ) / p ) + c + b );
      },
      easeInOut: function( t, b, c, d, a, p ) {
        if ( t == 0 ) return b;
        if ( ( t /= d / 2 ) == 2 ) return b + c;
        if ( !p ) p = d * ( .3 * 1.5 );
        if ( !a || a < math.abs( c ) ) {
          a = c;
          var s = p / 4;
        } else { 
          var s = p / ( 2 * math.PI ) * math.asin( c / a );
        }
        if ( t < 1 ) return -.5 * ( a * math.pow( 2, 10 * ( t -= 1 ) ) * math.sin( ( t * d - s ) * ( 2 * math.PI ) / p ) ) + b;
        return a * math.pow( 2, -10 * ( t -= 1 ) ) * math.sin( ( t * d - s ) * ( 2 * math.PI ) / p ) * .5 + c + b;
      }
    },
    back: {
      easeIn: function( t, b, c, d, s ) {
        if ( s == undefined ) s = 1.70158;
        return c * ( t /= d ) * t * ( ( s + 1 ) * t - s ) + b;
      },
      easeOut: function( t, b, c, d, s ) {
        if ( s == undefined ) s = 1.70158;
        return c * ( ( t = t / d - 1 ) * t * ( ( s + 1 ) * t + s ) + 1 ) + b;
      },
      easeInOut: function( t, b, c, d, s ) {
        if ( s == undefined ) s = 1.70158;
        if ( ( t /= d / 2 ) < 1 ) return c / 2 * ( t * t * ( ( ( s *= ( 1.525 ) ) + 1 ) * t - s ) ) + b;
        return c / 2 * ( ( t -= 2 ) * t * ( ( ( s *= ( 1.525 ) ) + 1 ) * t + s ) + 2 ) + b;
      }
    },
    bounce: {
      easeIn: function( t, b, c, d ) {
        return c - tween.Bounce.easeOut( d - t, 0, c, d ) + b;
      },
      easeOut: function( t, b, c, d ) {
        if ( ( t /= d ) < ( 1 / 2.75 ) ) {
          return c * ( 7.5625 * t * t ) + b;
        } else if ( t < ( 2 / 2.75 ) ) {
          return c * ( 7.5625 * ( t -= ( 1.5 / 2.75 ) ) * t + .75 ) + b;
        } else if ( t < ( 2.5 / 2.75 ) ) {
          return c * ( 7.5625 * ( t -= ( 2.25 / 2.75 ) ) * t + .9375 ) + b;
        } else {
          return c * ( 7.5625 * ( t -= ( 2.625 / 2.75 ) ) * t + .984375 ) + b;
        }
      },
      easeInOut: function( t, b, c, d ) {
        if ( t < d / 2 ) return tween.Bounce.easeIn( t * 2, 0, c, d ) * .5 + b;
        else return tween.Bounce.easeOut( t * 2 - d, 0, c, d ) * .5 + c * .5 + b;
      }
    }
  } );

  return tween;

} );