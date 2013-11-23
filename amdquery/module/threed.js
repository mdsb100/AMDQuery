aQuery.define( "module/threed", [ "main/event", "module/math" ], function( $, event, math ) {
	"use strict"; //启用严格模式

	var
	M = Math,
		martrix = math.martrix,
		threed = {
			rotate: function( m, o ) {
				o.x && ( m = this.rotateX( m, o.x ) );
				o.y && ( m = this.rotateY( o.y ) );
				o.z && ( m = this.rotateZ( o.z ) );
				return m;
			},
			rotateX: function( m, x ) {
				var cosX = Math.cos( x ),
					sinX = Math.sin( x );
				return martrix.multiply( m, [
        [ 1, 0, 0, 0 ],
        [ 0, cosX, -sinX, 0 ],
        [ 0, sinX, cosX, 0 ],
        [ 0, 0, 0, 1 ]
      ] );
			},
			rotateY: function( m, y ) {
				var cosY = M.cos( y ),
					sinY = M.sin( y );
				return martrix.multiply( m, [
        [ cosY, 0, sinY, 0 ],
        [ 0, 1, 0, 0 ],
        [ -sinY, 0, cosY, 0 ],
        [ 0, 0, 0, 1 ]
      ] );
			},
			rotateZ: function( m, z ) {
				var cosZ = M.cos( z ),
					sinZ = M.sin( z );
				return martrix.multiply( m, [
        [ cosZ, -sinZ, 0, 0 ],
        [ sinZ, cosZ, 0, 0 ],
        [ 0, 0, 1, 0 ],
        [ 0, 0, 0, 1 ]
      ] );
			},
			translate: function( m, x, y, z ) {
				return martrix.multiply( this.m, [
        [ 1, 0, 0, 0 ],
        [ 0, 1, 0, 0 ],
        [ 0, 0, 1, 0 ],
        [ x, y, z, 1 ]
      ] );
			}
		};


	function Space( location ) {
		this.m = martrix.init();
		this.mStack = [];
		this.location = location;
	}
	Space.prototype = {
		constructor: Space,

		flatten: function( point ) {
			var p = [
        [ point.x, point.y, point.z, 1 ]
      ],
				pm = martrix.multiply( p, this.m );

			point.tx = pm[ 0 ][ 0 ];
			point.ty = pm[ 0 ][ 1 ];
			point.tz = pm[ 0 ][ 2 ];
			// lazy projection
			point.fx = this.location.x + ( this.location.w * point.tx / point.tz );
			point.fy = this.location.y - ( this.location.h * point.ty / point.tz );

			return point;
		},

		push: function() {
			var m = this.m;
			this.mStack.push( m );
			m = [
        [ m[ 0 ][ 0 ], m[ 0 ][ 1 ], m[ 0 ][ 2 ], m[ 0 ][ 3 ] ],
        [ m[ 1 ][ 0 ], m[ 1 ][ 1 ], m[ 1 ][ 2 ], m[ 1 ][ 3 ] ],
        [ m[ 2 ][ 0 ], m[ 2 ][ 1 ], m[ 2 ][ 2 ], m[ 2 ][ 3 ] ],
        [ m[ 3 ][ 0 ], m[ 3 ][ 1 ], m[ 3 ][ 2 ], m[ 3 ][ 3 ] ]
      ];
			return this;
		},
		pop: function() {
			this.m = this.mStack.pop();
			return this;
		},

		rotate: function( o ) {
			this.m = threed.rotate( this.m, o );
			return this;
		},
		rotateX: function( x ) {
			this.m = threed.rotateX( this.m, x );
			return this;
		},
		rotateY: function( y ) {
			this.m = threed.rotateY( this.m, y );
			return this;
		},
		rotateZ: function( z ) {
			this.m = threed.rotateX( this.m, z );
			return this;
		},

		translate: function( x, y, z ) {
			this.m = threed.translate( this.m, x, y, z );
			return this;
		}
	};

	threed.Space = Space;

	function Point( x, y, z ) {
		this.init( x, y, z );
	}
	Point.prototype = {
		constructor: Point,

		init: function( x, y, z ) {
			this.x = x;
			this.y = y;
			this.z = z;
		},
		initRelative: function( tx, ty, tz ) {
			// Relative to camera coordinates
			this.tx = tx;
			this.ty = ty;
			this.tz = tz;
		},
		initFlattened: function( fx, fy ) {
			// Flattened coordinates
			this.fx = fx;
			this.fy = fy;
		},

		martrixToPoint: function( m ) {
			this.init( m[ 0 ][ 0 ], m[ 0 ][ 1 ], m[ 0 ][ 2 ] );
		},

		pointToMartrix: function() {
			return [ [ this.x, this.y, this.z, 1 ] ];
		},

		rotate: function( o ) {
			this.martrixToPoint( threed.rotate( this.pointToMartrix(), o ) );
			return this;
		},
		rotateX: function( x ) {
			this.martrixToPoint( threed.rotateX( this.pointToMartrix(), x ) );
			return this;
		},
		rotateY: function( y ) {
			this.martrixToPoint( threed.rotateY( this.pointToMartrix(), y ) );
			return this;
		},
		rotateZ: function( z ) {
			this.martrixToPoint( threed.rotateZ( this.pointToMartrix(), z ) );
			return this;
		},

		translate: function( x, y, z ) {
			this.martrixToPoint( threed.translate( this.pointToMartrix(), x, y, z ) );
			return this;
		}
	};

	threed.Point = Point;

	function Polygon( ctx, points, normal, backface, type, color ) {
		this.points = points;
		this.ctx = ctx;
		this.origin = new Point( 0, 0, 0 );

		for ( var i = 0; i < this.points.length; i++ ) {
			this.origin.x += this.points[ i ].x;
			this.origin.y += this.points[ i ].y;
			this.origin.z += this.points[ i ].z;
		}

		this.origin.x /= this.points.length;
		this.origin.y /= this.points.length;
		this.origin.z /= this.points.length;

		if ( normal ) {
			this.normal = new Point( this.origin.x + normal.x,
				this.origin.y + normal.y,
				this.origin.z + normal.z );
		} else {
			this.normal = null;
		}

		this.backface = backface;
		this.type = type;
		this.color = color;
	}
	Polygon.prototype = {
		each: function( fn ) {
			for ( var i = 0, p; p = this.points[ i ]; i++ ) {
				fn.call( this, p, i );
			}
			return this;
		},

		draw: function() {
			//            this.ctx.beginPath();
			//            this.ctx.moveTo(this.points[0].fx, this.points[0].fy);

			//            for (var i = 0; i < this.points.length; i++) {
			//                this.ctx.lineTo(this.points[i].fx, this.points[i].fy);
			//            }

			//            this.ctx.closePath();

			//            var color = this.color;

			//            /*
			//            // Do lighting here
			//            lightvector = Math.abs(this.normal.x + this.normal.y);
			//            if(lightvector > 1) {
			//            lightvector = 1;
			//            }

			//            color[0] = (color[0] * lightvector).toString();
			//            color[1] = (color[1] * lightvector).toString();
			//            color[2] = (color[2] * lightvector).toString();
			//            */

			//            if (color.length > 3) {
			//                var style = ["rgba(",
			//				             color[0], ",",
			//				             color[1], ",",
			//				             color[2], ",",
			//				             color[3], ")"].join("");
			//            } else {
			//                var style = ["rgb(",
			//				             color[0], ",",
			//				             color[1], ",",
			//				             color[2], ")"].join("");
			//            }

			//            if (this.type == Polygon.SOLID) {
			//                this.ctx.fillStyle = style;
			//                this.ctx.fill();
			//            } else if (this.type == Polygon.WIRE) {
			//                this.ctx.strokeStyle = style;
			//                this.ctx.stroke();
			//            }
		},

		rotate: function( o ) {
			return this.each( function( p ) {
				p.rotate( o );
			} );
		},
		rotateX: function( x ) {
			return this.each( function( p ) {
				p.rotateX( x );
			} );
		},
		rotateY: function( y ) {
			return this.each( function( p ) {
				p.rotateY( y );
			} );
		},
		rotateZ: function( z ) {
			return this.each( function( p ) {
				p.rotateZ( z );
			} );
		},

		translate: function( x, y, z ) {
			return this.each( function( p ) {
				p.translate( x, y, z );
			} );
		}
	};
	threed.Polygon = Polygon;
	//    Polygon.SOLID = 1;
	//    Polygon.WIRE = 2;
	$.threed = threed;

	return threed;

} );