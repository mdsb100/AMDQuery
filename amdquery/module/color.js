aQuery.define( "module/color", [ "base/extend", "main/object", "hash/cssColors" ], function( $, utilExtend, object, cssColors, undefined ) {
	// quote from colo.js by Andrew Brehaut, Tim Baumann
	"use strict"; //启用严格模式

	var css_integer = "(?:\\+|-)?\\d+",
		css_float = "(?:\\+|-)?\\d*\\.\\d+",
		css_number = "(?:' + css_integer + ')|(?:' + css_float + ')";

	css_integer = "(" + css_integer + ")";
	css_float = "(" + css_float + ")";
	css_number = "(" + css_number + ")";

	var css_percentage = css_number + "%",
		css_whitespace = "\\s*?";

	var hsl_hsla_regex = new RegExp( [
    "^hsl(a?)\\(", css_number, ",", css_percentage, ",", css_percentage, "(,", css_number, ")?\\)$"
  ].join( css_whitespace ) ),
		rgb_rgba_integer_regex = new RegExp( [
      "^rgb(a?)\\(", css_integer, ",", css_integer, ",", css_integer, "(,", css_number, ")?\\)$"
    ].join( css_whitespace ) ),
		rgb_rgba_percentage_regex = new RegExp( [
      "^rgb(a?)\\(", css_percentage, ",", css_percentage, ",", css_percentage, "(,", css_number, ")?\\)$"
    ].join( css_whitespace ) );

	//tools
	var between = $.between;

	function pad( val, len ) {
		val = val.toString();
		var padded = [];

		for ( var i = 0, j = Math.max( len - val.length, 0 ); i < j; i++ ) {
			padded.push( "0" );
		}

		padded.push( val );
		return padded.join( "" );
	}

	function color( type ) { //工厂方法
		if ( !( this instanceof color ) ) {
			return color.prototype.create( type );
		}
	}
	color.prototype = {
		create: function( o ) {
			if ( !o ) {
				return new color();
			}
			var i, item;
			for ( i in color.model ) {
				if ( item = color.model[ i ]( o ) ) {
					return item;
				}
			}

			return new color();
		},
		clone: function() {
			var o = new this.constructor(),
				p = this._propertys,
				i = 0,
				len = p.length,
				arg = [];
			for ( ; i < len; ) {
				arg.push( this[ p[ i++ ] ] );
			}
			o.init.apply( o, arg );
			return o;
		},
		toCSS: function() {
			return "";
		},
		toString: function() {
			return this.toCSS();
		}
	};

	utilExtend.easyExtend( color, {
		toRGBA: function( c, a ) {
			if ( c.indexOf( "#" ) == 0 ) {
				var
				r = "0x" + c.substring( 1, 3 ),
					g = "0x" + c.substring( 3, 5 ),
					b = "0x" + c.substring( 5, 7 );
				return [ "rgba(", +r, ",", +g, ",", +b, ",", a, ")" ].join( "" );
			} else if ( c.indexOf( "rgb" ) == 0 )
				return c.replace( "rgb", "rgba" ).replace( ")", "," + a + ")" );
		},
		model: {
			HSL: HSL,
			HSV: HSV,
			RGB: RGB
		}
	} );

	function RGB( r, g, b ) {
		if ( !( this instanceof RGB ) ) {
			return RGB.prototype.create( r );
		}
		this.init( r, g, b );
	}

	object.inheritProtypeWithCombination( RGB, color );
	utilExtend.easyExtend( RGB.prototype, {
		red: 0,
		green: 0,
		blue: 0,

		_stringParsers: [
      // CSS RGB(A) literal:
      function( css ) {
				css = $.util.trim( css );

				var withInteger = match( rgb_rgba_integer_regex, 255 );
				if ( withInteger ) {
					return withInteger;
				}
				return match( rgb_rgba_percentage_regex, 100 );

				function match( regex, max_value ) {
					var colorGroups = css.match( regex ),
						r, g, b;

					// If there is an "a" after "rgb", there must be a fourth parameter and the other way round
					if ( !colorGroups || ( !! colorGroups[ 1 ] + !! colorGroups[ 5 ] === 1 ) ) {
						return null;
					}


					r = between( 0, 1, colorGroups[ 2 ] / max_value );
					g = between( 0, 1, colorGroups[ 3 ] / max_value );
					b = between( 0, 1, colorGroups[ 4 ] / max_value );
					return new RGB( r, g, b );
				}
      },

      function( css ) {
				var lower = css.toLowerCase(),
					bytes, max;
				if ( lower in cssColors ) {
					css = cssColors[ lower ];
				}

				if ( !css.match( /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/ ) ) {
					return;
				}

				css = css.replace( /^#/, "" );

				bytes = css.length / 3;

				max = Math.pow( 16, bytes ) - 1;

				var
				r = parseInt( css.slice( 0, bytes ), 16 ) / max,
					g = parseInt( css.slice( bytes * 1, bytes * 2 ), 16 ) / max,
					b = parseInt( css.slice( bytes * 2 ), 16 ) / max;
				return new RGB( r, g, b );
      }
    ],

		_fromCSS: function( css ) {
			var color = null;
			for ( var i = 0, j = this._stringParsers.length; i < j; i++ ) {
				if ( color = this._stringParsers[ i ]( css ) ) return color;
			}
		},

		_fromRGB: function( RGB ) {
			return new RGB( RGB.red, RGB.green, RGB.blue );
		},

		_propertys: [ "red", "green", "blue" ],

		blend: function( color, alpha ) {
			color = color.toRGB();
			alpha = between( 0, 1, alpha );
			var rgb = this.clone();
			rgb.init( ( rgb.red * ( 1 - alpha ) ) + ( color.red * alpha ), ( rgb.green * ( 1 - alpha ) ) + ( color.green * alpha ), ( rgb.blue * ( 1 - alpha ) ) + ( color.blue * alpha ) );

			return rgb;
		},

		constructor: RGB,
		create: function( o ) {
			if ( "string" == typeof o ) {
				return this._fromCSS( $.util.trim( o ) );
			}
			if ( o.hasOwnProperty( "red" ) && o.hasOwnProperty( "green" ) && o.hasOwnProperty( "blue" ) ) {
				return this._fromRGB( o );
			}
		},

		getLuminance: function() {
			return ( this.red * 0.2126 ) + ( this.green * 0.7152 ) + ( this.blue * 0.0722 );
		},

		init: function( r, g, b ) {
			this.red = r;
			this.green = g;
			this.blue = b;
			return this;
		},

		toCSS: function( bytes ) {
			bytes = bytes || 2;
			var max = Math.pow( 16, bytes ) - 1;
			var css = [
        "#",
        pad( Math.round( this.red * max ).toString( 16 ).toUpperCase(), bytes ),
        pad( Math.round( this.green * max ).toString( 16 ).toUpperCase(), bytes ),
        pad( Math.round( this.blue * max ).toString( 16 ).toUpperCase(), bytes )
      ];

			return css.join( "" );
		},

		toHSV: function() {
			var min, max, delta, value, hue, saturation;

			min = Math.min( this.red, this.green, this.blue );
			max = Math.max( this.red, this.green, this.blue );
			value = max; // v

			delta = max - min;

			if ( delta == 0 ) { // white, grey, black
				hue = saturation = 0;
			} else { // chroma
				saturation = delta / max;

				if ( this.red == max ) {
					hue = ( this.green - this.blue ) / delta; // between yellow & magenta
				} else if ( this.green == max ) {
					hue = 2 + ( this.blue - this.red ) / delta; // between cyan & yellow
				} else {
					hue = 4 + ( this.red - this.green ) / delta; // between magenta & cyan
				}

				hue = ( ( hue * 60 ) + 360 ) % 360; // degrees
			}

			return new HSV( hue, saturation, value );
		},
		toHSL: function() {
			return this.toHSV().toHSL();
		},

		toRGB: function() {
			return this.clone();
		}

	} );
	object.providePropertyGetSet( RGB, RGB.prototype._propertys );

	function HSV( hue, saturation, value ) {
		if ( !( this instanceof HSV ) ) {
			return HSV.prototype.create( hue, saturation, value );
		}
		this.init( hue, saturation, value );
	}

	object.inheritProtypeWithCombination( HSV, color );
	utilExtend.easyExtend( HSV.prototype, {
		hue: 0,
		saturation: 0,
		value: 1,

		_normalise: function() {
			this.hue %= 360;
			this.saturation = between( 0, 1, this.saturation );
			this.value = between( 0, 1, this.value );
		},
		_propertys: [ "hue", "saturation", "value" ],
		_sfd: function( a ) {
			return this.desaturateByAmount( a );
		},

		constructor: HSV,
		create: function( h, s, v ) {
			if ( h.hasOwnProperty( "hue" ) && h.hasOwnProperty( "saturation" ) && h.hasOwnProperty( "value" ) ) {
				return new HSV( h.hue, h.saturation, h.value );
			} else if ( v != undefined ) {
				return new HSV( h, s, v );
			}
		},

		init: function( h, s, v ) {
			this.hue = h;
			this.saturation = s;
			this.value = v;
			this._normalise();
			return this;
		},

		shiftHue: function( degrees ) {
			var hue = ( this.hue + degrees ) % 360;
			if ( hue < 0 ) {
				hue = ( 360 + hue ) % 360;
			}

			this.hue = hue;
		},

		darkenByAmount: function( val ) {
			this.value = between( 0, 1, this.value - val );
		},

		darkenByRatio: function( val ) {
			this.value = between( 0, 1, this.value * ( 1 - val ) );
		},

		lightenByAmount: function( val ) {
			this.value = between( 0, 1, this.value + val );
		},

		lightenByRatio: function( val ) {
			this.value = between( 0, 1, this.value * ( 1 + val ) );
		},

		desaturateByAmount: function( val ) {
			this.saturation = between( 0, 1, this.saturation - val );
		},

		desaturateByRatio: function( val ) {
			this.saturation = between( 0, 1, this.saturation * ( 1 - val ) );
		},

		saturateByAmount: function( val ) {
			this.saturation = between( 0, 1, this.saturation + val );
		},

		saturateByRatio: function( val ) {
			this.saturation = between( 0, 1, this.saturation * ( 1 + val ) );
		},

		schemeFromDegrees: function( degrees ) {
			for ( var newColors = [], i = 0, j = degrees.length, col; i < j; i++ ) {
				col = this.clone();
				col.hue = ( this.hue + degrees[ i ] ) % 360;
				newColors.push( col );
			}
			return newColors;
		},

		complementaryScheme: function() {
			return this._sfd( [ 0, 180 ] );
		},

		splitComplementaryScheme: function() {
			return this._sfd( [ 0, 150, 320 ] );
		},

		splitComplementaryCWScheme: function() {
			return this._sfd( [ 0, 150, 300 ] );
		},

		splitComplementaryCCWScheme: function() {
			return this._sfd( [ 0, 60, 210 ] );
		},

		triadicScheme: function() {
			return this._sfd( [ 0, 120, 240 ] );
		},

		clashScheme: function() {
			return this._sfd( [ 0, 90, 270 ] );
		},

		tetradicScheme: function() {
			return this._sfd( [ 0, 90, 180, 270 ] );
		},

		fourToneCWScheme: function() {
			return this._sfd( [ 0, 60, 180, 240 ] );
		},

		fourToneCCWScheme: function() {
			return this._sfd( [ 0, 120, 180, 300 ] );
		},

		fiveToneAScheme: function() {
			return this._sfd( [ 0, 115, 155, 205, 245 ] );
		},

		fiveToneBScheme: function() {
			return this._sfd( [ 0, 40, 90, 130, 245 ] );
		},

		fiveToneCScheme: function() {
			return this._sfd( [ 0, 50, 90, 205, 320 ] );
		},

		fiveToneDScheme: function() {
			return this._sfd( [ 0, 40, 155, 270, 310 ] );
		},

		fiveToneEScheme: function() {
			return this._sfd( [ 0, 115, 230, 270, 320 ] );
		},

		sixToneCWScheme: function() {
			return this._sfd( [ 0, 30, 120, 150, 240, 270 ] );
		},

		sixToneCCWScheme: function() {
			return this._sfd( [ 0, 90, 120, 210, 240, 330 ] );
		},

		neutralScheme: function() {
			return this._sfd( [ 0, 15, 30, 45, 60, 75 ] );
		},

		analogousScheme: function() {
			return this._sfd( [ 0, 30, 60, 90, 120, 150 ] );
		},

		toRGB: function() {
			this._normalise();

			var i, f, p, q, t, r, g, b, h = this.hue,
				s = this.saturation,
				v = this.value;

			if ( this.saturation === 0 ) {
				// achromatic (grey)
				r = this.value;
				g = this.value;
				b = this.value;
			} else {
				h = h / 60; // sector 0 to 5
				i = Math.floor( h );
				f = h - i; // factorial part of h
				p = v * ( 1 - s );
				q = v * ( 1 - s * f );
				t = v * ( 1 - s * ( 1 - f ) );

				switch ( i ) {
					case 0:
						r = v;
						g = t;
						b = p;
						break;
					case 1:
						r = q;
						g = v;
						b = p;
						break;
					case 2:
						r = p;
						g = v;
						b = t;
						break;
					case 3:
						r = p;
						g = q;
						b = v;
						break;
					case 4:
						r = t;
						g = p;
						b = v;
						break;
					default: // case 5:
						r = v;
						g = p;
						b = q;
						break;
				}
			}
			return new RGB( r, g, b );
		},
		toHSL: function() {
			this._normalise();

			var hue = this.hue,
				saturation,
				lightness,
				l = ( 2 - this.saturation ) * this.value,
				s = this.saturation * this.value;
			if ( l && 2 - l ) {
				s /= ( l <= 1 ) ? l : 2 - l;
			}
			l /= 2;
			saturation = s;
			lightness = l;

			return new HSL( hue, saturation, lightness );
		},
		toHSV: function() {
			return this.clone();
		}

	} );
	object.providePropertyGetSet( HSV, HSV.prototype._propertys );

	function HSL( hue, saturation, lightness ) {
		if ( !( this instanceof HSL ) ) {
			return HSL.prototype.create( hue, saturation, lightness );
		}
		this.init( hue, saturation, lightness );
	}

	object.inheritProtypeWithCombination( HSL, color );
	utilExtend.easyExtend( HSL.prototype, {
		hue: 0,
		saturation: 0,
		lightness: 0,

		_normalise: function() {
			this.hue = ( this.hue % 360 + 360 ) % 360;
			this.saturation = between( 0, 1, this.saturation );
			this.lightness = between( 0, 1, this.lightness );
		},

		constructor: HSL,
		create: function( h, s, l ) {
			if ( "string" == typeof h ) {
				var cg = $.util.trim( h ).match( hsl_hsla_regex );
				if ( !cg || ( !! cg[ 1 ] + !! cg[ 5 ] === 1 ) ) {
					return null;
				}
				return new HSL( cg[ 2 ], parseInt( cg[ 3 ], 10 ) / 100, parseInt( cg[ 4 ], 10 ) / 100 );
			}
			if ( h.hasOwnProperty( "hue" ) &&
				h.hasOwnProperty( "saturation" ) &&
				h.hasOwnProperty( "lightness" ) ) {
				return new HSL( h.hue, h.saturation, h.lightness );
			} else if ( l != undefined ) {
				return new HSL( h, s, l );
			}
		},

		init: function( h, s, l ) {
			this.hue = h;
			this.saturation = s;
			this.lightness = l;
			this._normalise();
			return this;
		},

		toHSL: function() {
			return this.clone();
		},
		toHSV: function() {
			this._normalise();

			//hsv.hue = this.hue; // H
			var l = 2 * this.lightness,
				s = this.saturation * ( ( l <= 1 ) ? l : 2 - l ),
				h = this.hue,
				v = ( l + s ) / 2; // V
			s = ( ( 2 * s ) / ( l + s ) ) || 0; // S

			return new HSV( h, s, v );
		},
		toRGB: function() {
			return this.toHSV().toRGB();
		}

	} );
	object.providePropertyGetSet( HSL, HSL.prototype._propertys );

	$.color = color;

	return color;

} );