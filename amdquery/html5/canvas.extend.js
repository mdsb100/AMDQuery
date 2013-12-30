aQuery.define( "html5/canvas.extend", [ "base/extend", "html5/canvas" ], function( $, utilExtend, canvas, undefined ) {
	"use strict";
	if ( canvas ) {
		var R = Math.round,
			PI = Math.PI,
			M = Math,
			toRGBA = function( c, a ) {
				if ( c.indexOf( "#" ) == 0 ) {
					var
					r = "0x" + c.substring( 1, 3 ),
						g = "0x" + c.substring( 3, 5 ),
						b = "0x" + c.substring( 5, 7 );
					return [ "rgba(", +r, ",", +g, ",", +b, ",", a, ")" ].join( "" );
				} else if ( c.indexOf( "rgb" ) == 0 )
					return c.replace( "rgb", "rgba" ).replace( ")", "," + a + ")" );
			};

		utilExtend.easyExtend( canvas.prototype, {
			borderRedius: function( b, c, d, e, f ) { //x, y, w, h, curv//1,2 // curvBorder
				var a = this;
				b = R( b ) + 0.5;
				c = R( c ) + 0.5;
				d = R( d ) + b - 1;
				e = R( e ) + c - 1;
				f = R( f );
				//d += b;
				//e += c;
				a.lw()
					.b()
					.m( b + f, c ) //左上
				.l( d - f, c ) //右上
				.qc( d, c, d, c + f )
					.l( d, e - f ) //右下
				.qc( d, e, d - f, e )
					.l( b + f, e ) //左下
				.qc( b, e, b, e - f )
					.l( b, c + f ) //左上
				.qc( b, c, b + f, c )
					.c();

				return this;
			},

			cg: function( r, w, c, a ) { //rate, width, color, opacity; curve border grad
				w = R( w );
				var o = this,
					z = R( w * r ),
					y = R( w - z );

				o.b() //纵过渡
				.lg( 0, 0, 0, w, [
          [ 0, toRGBA( c, 0 ) ],
          [ r, toRGBA( c, a ) ],
          [ 1 - r, toRGBA( c, a ) ],
          [ 1, toRGBA( c, 0 ) ]
        ] )
					.fr( z, 0, y - z, w )
					.b() //左过渡
				.lg( 0, 0, z, 0, [
          [ 0, toRGBA( c, 0 ) ],
          [ 1, toRGBA( c, a ) ]
        ] )
					.fr( 0, z, z, y - z )
					.b() //右过渡
				.lg( y, 0, w, 0, [
          [ 0, toRGBA( c, a ) ],
          [ 1, toRGBA( c, 0 ) ]
        ] )
					.fr( y, z, z, y - z )
					.b() //1
				.rg( y, y, 0, y, y, z, [
          [ 0, toRGBA( c, a ) ],
          [ 1, toRGBA( c, 0 ) ]
        ] )
					.a( y, y, z, 0, PI * 0.5, 0 )
					.l( y, y )
					.c()
					.f()
					.b() //2
				.rg( y, z, 0, y, z, z, [
          [ 0, toRGBA( c, a ) ],
          [ 1, toRGBA( c, 0 ) ]
        ] )
					.a( y, z, z, PI * 1.5, 0, 0 )
					.l( y, z )
					.c()
					.f()
					.b() //3
				.rg( z, z, 0, z, z, z, [
          [ 0, toRGBA( c, a ) ],
          [ 1, toRGBA( c, 0 ) ]
        ] )
					.a( z, z, z, PI, PI * 1.5, 0 )
					.l( z, z )
					.c()
					.f()
					.b() //4
				.rg( z, y, 0, z, y, z, [
          [ 0, toRGBA( c, a ) ],
          [ 1, toRGBA( c, 0 ) ]
        ] )
					.a( z, y, z, PI * 0.5, PI, 0 )
					.l( z, y )
					.c()
					.f();
				return this;
			},

			dashedLineTo: function( fromX, fromY, toX, toY, pattern ) {
				var lt = function( a, b ) {
					return a <= b;
				},
					gt = function( a, b ) {
						return a >= b;
					},
					capmin = function( a, b ) {
						return M.mn( a, b );
					},
					capmax = function( a, b ) {
						return M.mx( a, b );
					},
					checkX = {
						thereYet: gt,
						cap: capmin
					},
					checkY = {
						thereYet: gt,
						cap: capmin
					};
				if ( fromY - toY > 0 ) {
					checkY.thereYet = lt;
					checkY.cap = capmax;
				}
				if ( fromX - toX > 0 ) {
					checkX.thereYet = lt;
					checkX.cap = capmax;
				}

				this.m( fromX, fromY );
				var offsetX = fromX;
				var offsetY = fromY,
					idx = 0,
					dash = true;
				while ( !( checkX.thereYet( offsetX, toX ) && checkY.thereYet( offsetY, toY ) ) ) {
					var ang = M.at2( toY - fromY, toX - fromX ),
						len = pattern[ idx ];
					offsetX = checkX.cap( toX, offsetX + ( M.c( ang ) * len ) );
					offsetY = checkY.cap( toY, offsetY + ( M.s( ang ) * len ) );
					if ( dash ) this.l( offsetX, offsetY );
					else this.m( offsetX, offsetY );
					idx = ( idx + 1 ) % pattern.length;
					dash = !dash;
				}
				return this;
			}

		} );
	}
	return canvas;
} );