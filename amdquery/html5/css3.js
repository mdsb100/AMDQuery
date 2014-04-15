aQuery.define( "html5/css3", [ "base/support", "base/extend", "base/typed", "base/client", "base/array", "main/css" ], function( $, support, utilExtend, typed, client, array, css2, undefined ) {
	"use strict";
	this.describe( "HTML5 CSS3" );

	var
	transformCssName = "",
		transitionCssName = "",
		hasCss3 = false,
		hasTransform = false,
		hasTransform3d = false,
		hasTransition = false,
		domStyle = document.documentElement.style,
		css3Head = ( function() {
			var head = "";
			if ( client.engine.ie )
				head = "ms";
			else if ( client.engine.webkit || client.system.mobile )
				head = "webkit";
			else if ( client.engine.gecko )
				head = "Moz";
			else if ( client.engine.opera )
				head = "O";
			return head;
		} )(),
		vendorPropName = function( style, name ) {

			// shortcut for names that are not vendor prefixed
			var origName = name;
			name = $.util.camelCase( origName );
			if ( name in style ) {
				return name;
			}

			// check for vendor prefixed names
			name = $.util.camelCase( origName, css3Head );
			if ( name in style ) {
				return name;
			}

		},
		getCss3Support = function( type ) {
			return ( $.util.camelCase( type ) in domStyle || $.util.camelCase( type, css3Head ) in domStyle );
		},
		css3Hooks = {
			linearGradient: {
				styleKey: null
			},
			repeatingLinearGradient: {
				styleKey: null
			},
			radialGradient: {
				grammar: null,
				styleKey: null
			},
			repeatingRadialGradient: {
				grammar: null,
				styleKey: null
			}
		},
		css3Support = ( function() {
			var result = {};

			result.css3 = hasCss3 = getCss3Support( "boxShadow" );

			transformCssName = vendorPropName( domStyle, "transform" );
			result.transform = hasTransform = !! transformCssName;

			if ( hasTransform ) {
				hasTransform3d = getCss3Support( "transformStyle" );
			}

			result.transform3d = hasTransform3d;

			result.animation = getCss3Support( "animationName" );

			transitionCssName = vendorPropName( domStyle, "transition" );
			result.transition = hasTransition = !! transitionCssName;

			function detectLinearGradient( name, head, styleKey, background ) {
				if ( !result[ name ] ) {
					try {
						domStyle.background = head + styleKey + background;
						result[ name ] = domStyle.background.indexOf( "gradient" ) > -1;
						css3Hooks[ name ].styleKey = head + styleKey;
					} catch ( e ) {

					} finally {
						domStyle.background = "";
					}
				}
			}

			var linearGradientKey = "linear-gradient(to ",
				linearGradientValue = "left, white, black)",
				linearGradientHead = "-" + css3Head.toLowerCase() + "-";

			detectLinearGradient( "linearGradient", "", linearGradientKey, linearGradientValue );
			detectLinearGradient( "linearGradient", linearGradientHead, linearGradientKey, linearGradientValue );

			detectLinearGradient( "repeatingLinearGradient", "", "repeating-" + linearGradientKey, linearGradientValue );
			detectLinearGradient( "repeatingLinearGradient", linearGradientHead, "repeating-" + linearGradientKey, linearGradientValue );

			linearGradientKey = "linear-gradient("

			detectLinearGradient( "linearGradient", "", linearGradientKey, linearGradientValue );
			detectLinearGradient( "linearGradient", linearGradientHead, linearGradientKey, linearGradientValue );

			detectLinearGradient( "repeatingLinearGradient", "", "repeating-" + linearGradientKey, linearGradientValue );
			detectLinearGradient( "repeatingLinearGradient", linearGradientHead, "repeating-" + linearGradientKey, linearGradientValue );


			function detectRadialGradient( name, head, styleKey, grammar, position, sizeAndShape, background ) {
				if ( !result[ name ] ) {
					try {
						var str = [ head + styleKey ];
						if ( grammar === "at" ) {
							str.push( sizeAndShape, grammar, position + ",", background );
						} else {
							str.push( position + ",", sizeAndShape + ",", background );
						}
						domStyle.background = str.join( " " );
						result[ name ] = domStyle.background.indexOf( "gradient" ) > -1;
						css3Hooks[ name ].grammar = grammar;
						css3Hooks[ name ].styleKey = head + styleKey;
					} catch ( e ) {

					} finally {
						domStyle.background = "";
					}
				}
			}

			var radialGradientKey = "radial-gradient(",
				radialGradientValue = "white, black )",
				radialGradientGrammar = "at",
				radialGradientPosition = "50% 50%",
				radialSizeAndShape = "farthest-side circle",
				radialGradientHead = "-" + css3Head.toLowerCase() + "-";

			detectRadialGradient( "radialGradient", "", radialGradientKey, radialGradientGrammar, radialGradientPosition, radialSizeAndShape, radialGradientValue );
			detectRadialGradient( "radialGradient", radialGradientHead, radialGradientKey, radialGradientGrammar, radialGradientPosition, radialSizeAndShape, radialGradientValue );

			detectRadialGradient( "repeatingRadialGradient", "", "repeating-" + radialGradientKey, radialGradientGrammar, radialGradientPosition, radialSizeAndShape, radialGradientValue );
			detectRadialGradient( "repeatingRadialGradient", radialGradientHead, "repeating-" + radialGradientKey, radialGradientGrammar, radialGradientPosition, radialSizeAndShape, radialGradientValue );

			detectRadialGradient( "radialGradient", "", radialGradientKey, "", radialGradientPosition, radialSizeAndShape, radialGradientValue );
			detectRadialGradient( "radialGradient", radialGradientHead, radialGradientKey, "", radialGradientPosition, radialSizeAndShape, radialGradientValue );

			detectRadialGradient( "repeatingRadialGradient", "", "repeating-" + radialGradientKey, "", radialGradientPosition, radialSizeAndShape, radialGradientValue );
			detectRadialGradient( "repeatingRadialGradient", radialGradientHead, "repeating-" + radialGradientKey, "", radialGradientPosition, radialSizeAndShape, radialGradientValue );

			return result;
		} )(),
		isFullCss = function( value ) {
			return value != "" && value !== "none" && value != null;
		}, orientationMap = {
			"top": "50% 100%, 50% 0%",
			"bottom": "50% 0%, 50% 100%",
			"left": "100% 50%, 0% 50%",
			"top left": "100% 100%, 0% 0%",
			"top right": "0% 0%, 100% 100%",
			"bottom right": "0% 0%, 100% 100%",
			"bottom left": "100% 0%, 0% 100%"
		};

	if ( hasTransform ) {
		var transformReg = {
			translate3d: /translate3d\([^\)]+\)/,
			translate: /translate\([^\)]+\)/,
			rotate: /rotate\([^\)]+\)/,
			rotateX: /rotateX\([^\)]+\)/,
			rotateY: /rotateY\([^\)]+\)/,
			rotateZ: /rotateZ\([^\)]+\)/,
			scale: /scale\([^\)]+\)/,
			scaleX: /scaleX\([^\)]+\)/,
			scaleY: /scaleY\([^\)]+\)/,
			skew: /skew\([^\)]+\)/
		},
			transform3dNameMap = {
				translateX: 1,
				translateY: 2,
				translateZ: 3,
				scaleX: 1,
				scaleY: 1

			},
			editScale = function( obj ) {
				var sx = obj.sx != undefined ? obj.sx : obj.scaleX || 1,
					sy = obj.sy != undefined ? obj.sy : obj.scaleY || 1;

				return [
					"scale(", Math.max( 0, sx ),
					",", Math.max( 0, sy ), ") "
					];
			},
			editTranslate3d = function( obj ) {
				return [ "translate3d(",
					obj.tx != undefined ? obj.tx + "px" : obj.translateX || 0, ", ",
					obj.ty != undefined ? obj.ty + "px" : obj.translateY || 0, ", ",
					obj.tz != undefined ? obj.tz + "px" : obj.translateZ || 0, ") " ]
			},
			editRotate3d = function( obj ) {
				return [ "rotateX(", obj.rx != undefined ? obj.rx + "deg" : obj.rotateX || 0, ") ",
					"rotateY(", obj.ry != undefined ? obj.ry + "deg" : obj.rotateY || 0, ") ",
					"rotateZ(", obj.rz != undefined ? obj.rz + "deg" : obj.rotateZ || 0, ") " ]
			},
			regTransform = /[^\d\w\.\-\+]+/,
			getTransformValue = function( transform, name ) {
				var result = [],
					transType = transform.match( transformReg[ name ] );
				if ( transType ) {
					result = transType[ 0 ].replace( ")", "" ).split( regTransform );
				}
				return result;
			},
			getTransformValues = function( transform ) {
				var result = [];
				transform = transform.split( ") " );
				$.each( transform, function( value ) {
					result.push( value.replace( ")", "" ).split( regTransform ) );
				} );
				return result;
			};
	}
	if ( hasTransition ) {
		var getTransitionValue = function( transition, name ) {
			var result = {}, temp, transType = transition.match( name + ".*," );
			if ( transType ) {
				temp = transType[ 0 ].replace( ",", "" ).split( " " );
				result.name = temp[ 0 ];
				result.duration = temp[ 1 ];
				result[ "function" ] = temp[ 2 ];
				result.delay && ( result.delay = temp[ 3 ] );
			}
			return result;
		},
			getTransitionValues = function( transition ) {
				var result = [],
					temp;
				$.each( transition.split( /,\s?/ ), function( transType ) {
					temp = transType.split( " " );
					temp = {
						name: temp[ 0 ],
						duration: temp[ 1 ],
						"function": temp[ 2 ]
					};
					temp.delay && ( temp.delay = temp[ 3 ] );
					result[ temp.name ] = temp;
					result.push( temp );
				} );
				return result;
			};
	}

	var createLinearGradient = function( key ) {
		function setDefaultColor( ele, option ) {
			if ( option.defaultColor ) {
				ele.style.background = option.defaultColor;
			}
		}

		if ( css3Support[ key ] ) {
			return function( ele, option ) {
				setDefaultColor( ele, option );
				var str = [];
				str.push( css3Hooks[ key ].styleKey );
				if ( option.orientation ) {
					str.push( option.orientation, "," );
				}
				$.each( option.colorStops, function( value, index ) {
					str.push( value.color );
					if ( typed.isNumber( value.stop ) ) {
						str.push( " " + value.stop * 100, "%" );
					} else if ( typed.isString( value.stop ) ) {
						str.push( " " + value.stop );
					}
					if ( option.colorStops.length - 1 !== index ) {
						str.push( "," );
					}
				} );
				str.push( ")" );
				ele.style.backgroundImage = str.join( "" );
				return this;
			}
		} else if ( client.browser.chrome > 10 || client.browser.safari >= 5.1 || client.system.mobile ) {
			return function( ele, option ) {
				setDefaultColor( ele, option );
				var str = [],
					orientation = option.orientation,
					length = option.colorStops.length;

				str.push( "-webkit-gradient", "(linear, " );

				if ( orientation != undefined ) {
					str.push( orientation, ", " );
				}

				str.push( "from(", option.colorStops[ 0 ].color, ")" );
				$.each( option.colorStops, function( value, index ) {
					str.push( ",", "color-stop", "(" );

					if ( typed.isNumber( value.stop ) ) {
						str.push( value.stop, ", " );
					} else if ( typed.isString( value.stop ) && /%$/.test( value.stop ) ) {
						str.push( value.stop, ", " );
					} else {
						str.push( ( 1 / ( length + 1 ) * ( index + 1 ) ).toFixed( 2 ), ", " );
					}
					str.push( value.color );

					str.push( ")" );
				} );
				str.push( ", to(", option.colorStops[ length - 1 ].color, ")" );
				str.push( ")" );
				ele.style, backgroundImage = str.join( "" );
				return this;
			}
		} else if ( client.browser.ie == 9 ) {
			return function( ele, option ) {
				setDefaultColor( ele, option );
				var str = [];
				str.push( "progid:DXImageTransform.Microsoft.gradient", "(" );
				str.push( "startColorstr=", "'", option.colorStops[ 0 ].color, "'" );
				str.push( ",", "endColorstr=", "'", option.colorStops[ option.colorStops.length - 1 ].color, "'" );
				str.push( ")" );
				ele.style.filter = str.join( "" );
				return this;
			}
		}

		return function( ele, option ) {
			setDefaultColor( ele, option );
			return this;
		}
	};

	var createRadialGradient = function( key ) {
		function setDefaultColor( ele, option ) {
			if ( option.defaultColor ) {
				ele.style.background = option.defaultColor;
			}
		}

		if ( css3Support[ key ] ) {
			return function( ele, option ) {
				setDefaultColor( ele, option );
				var str = [];
				str.push( css3Hooks[ key ].styleKey );
				var comma = false;
				if ( css3Hooks[ key ].grammar ) {

					if ( option.size != undefined ) {
						str.push( option.size, " " );
						comma = true;
					}
					if ( option.shape != undefined ) {
						str.push( option.shape, " " );
						comma = true;
					}
					if ( ( option.size || option.shape ) && option.position != undefined ) {
						str.push( css3Hooks[ key ].grammar, " " );
					}
					if ( option.position != undefined ) {
						str.push( option.position );
						comma = true;
					}
					if ( comma ) {
						str.push( ", " );
					}
				} else {
					if ( option.position != undefined ) {
						str.push( option.position, ", " );
					}
					if ( option.size != undefined ) {
						str.push( option.size, " " );
						comma = true;
					}
					if ( option.shape != undefined ) {
						str.push( option.shape );
						comma = true;
					}
					if ( comma ) {
						str.push( ", " );
					}
				}

				$.each( option.colorStops, function( value, index ) {
					str.push( value.color );
					if ( typed.isNumber( value.stop ) ) {
						str.push( " " + value.stop * 100, "%" );
					} else if ( typed.isString( value.stop ) ) {
						str.push( " " + value.stop );
					}
					if ( option.colorStops.length - 1 !== index ) {
						str.push( "," );
					}
				} );
				str.push( ")" );
				ele.style.backgroundImage = str.join( "" );
				return this;
			}
		} else if ( client.browser.chrome > 10 || client.browser.safari >= 5.1 || client.system.mobile ) {
			return function( ele, option ) {
				setDefaultColor( ele, option );
				var str = [];
				str.push( "-webkit-gradient", "(radial," );
				str.push( option.position, ", ", "0, " );
				str.push( option.position, ", ", Math.max( ele.offsetWidth, ele.offsetHeight ), ", " );
				str.push( "from(", option.colorStops[ 0 ].color, ")" );
				$.each( option.colorStops, function( value, index ) {
					str.push( ",", "color-stop", "(" );

					if ( typed.isNumber( value.stop ) ) {
						str.push( value.stop * 100, "%", ", " );
					} else if ( typed.isString( value.stop ) && /%$/.test( value.stop ) ) {
						str.push( value.stop, ", " );
					} else {
						str.push( ( 1 / ( option.colorStops.length + 1 ) * ( index + 1 ) * 100 ).toFixed( 2 ), "%, " );
					}
					str.push( value.color );

					str.push( ")" );
				} );
				str.push( ", to(", option.colorStops[ option.colorStops.length - 1 ].color, ")" );
				str.push( ")" );
				ele.style.backgroundImage = str.join( "" );
				return this;
			}
		} else if ( client.browser.ie == 9 ) {
			return function( ele, option ) {
				setDefaultColor( ele, option );
				var str = [];
				str.push( "progid:DXImageTransform.Microsoft.gradient", "(" );
				str.push( "startColorstr=", "'", option.colorStops[ 0 ].color, "'" );
				str.push( ",", "endColorstr=", "'", option.colorStops[ option.colorStops.length - 1 ].color, "'" );
				str.push( ")" );
				ele.style.filter = str.join( "" );
				return this;
			}
		}

		return function( ele, option ) {
			setDefaultColor( ele, option );
			return this;
		}
	};

	var css3 = {
		hooks: css3Hooks,
		transformCssName: transformCssName,
		transitionCssName: transitionCssName,
		getTransformStyleNameUnCamelCase: function() {
			var ret = $.util.unCamelCase( transformCssName );
			return transformCssName ?
				( ret.indexOf( "-" ) > -1 ? "-" + ret : ret ) :
				transformCssName;
		},
		getTransitionStyleNameUnCamelCase: function() {
			var ret = $.util.unCamelCase( transitionCssName );
			return transitionCssName ?
				( ret.indexOf( "-" ) > -1 ? "-" + ret : ret ) :
				transitionCssName;
		},
		addTransition: function( ele, style ) {
			return $.setTransition( ele, style, css2.css( ele, transitionCssName ) );
		},
		bindTransition: function( ele, style ) {
			var eleObj = $( ele );
			if ( !typed.isArray( style ) ) {
				style = [ style ];
			}
			$.each( style, function( item ) {
				$.each( item.events, function( value, name ) {
					eleObj.addHandler( name, function() {
						css2.css( this, $.util.camelCase( item.name ), value );
					} );
				} );
				if ( item.toggle ) {
					var arr = [ ele ];
					$.each( item.toggle, function( value, index ) {
						arr.push( function() {
							css2.css( this, $.util.camelCase( item.name, item.head ), value );
						} );
					} );
					$.toggle.apply( this, arr );
				}
			} );
			return $.setTransition( ele, style, css2.css( ele, transitionCssName ) );
		},

		css3: function( ele, name, value ) {
			if ( hasCss3 ) {
				name = $.util.camelCase( name );
				var hook = css3Hooks[ name ];
				if ( hook ) {
					if ( hook.set && value !== undefined ) {
						hook.set( ele, value );
					} else if ( hook.get && value === undefined ) {
						return hook.get( ele );
					}
				} else {
					name = this.vendorPropName( ele, name );
					if ( value === undefined ) {
						return css2.css( ele, name );
					} else {
						css2.css( ele, name, value );
					}
				}
			}
			return this;
		},
		css3Head: css3Head,
		css3Style: function( ele, name ) {
			return css2.style( ele, name, css3Head );
		},

		getCss3Support: function( type ) {
			return getCss3Support( type );
		},
		getTransform: function( ele, name ) {
			var result = [];
			if ( hasTransform ) {
				var transform = css2.css( ele, transformCssName ),
					temp, index = -1;
				if ( isFullCss( transform ) ) {
					if ( typed.isString( name ) ) {
						temp = getTransformValue( transform, name );
						result.push( temp );
					} else {
						result = getTransformValues( transform );
					}
				}
			}
			return result;
		},
		getTransform3d: function( ele, toNumber ) {
			var obj = {};
			if ( hasTransform3d ) {
				obj = {
					rotateX: 0,
					rotateY: 0,
					rotateZ: 0,
					translateX: 0,
					translateY: 0,
					translateZ: 0,
					scaleX: 1,
					scaleY: 1
				};
				var transform = css2.css( ele, transformCssName ),
					result, i;
				if ( isFullCss( transform ) ) {
					result = getTransformValue( transform, "rotateX" );
					result.length && ( obj.rotateX = result[ 1 ] );
					result = getTransformValue( transform, "rotateY" );
					result.length && ( obj.rotateY = result[ 1 ] );
					result = getTransformValue( transform, "rotateZ" );
					result.length && ( obj.rotateZ = result[ 1 ] );
					result = getTransformValue( transform, "scale" );
					result.length && ( obj.scaleX = result[ 1 ] ) && ( obj.scaleY = result[ 2 ] );
					result = getTransformValue( transform, "translate3d" );
					if ( result.length ) {
						obj.translateX = result[ 1 ];
						obj.translateY = result[ 2 ];
						obj.translateZ = result[ 3 ];
					}

					if ( toNumber === true ) {
						for ( i in obj ) {
							obj[ i ] = parseFloat( obj[ i ] );
						}
					}
				}
			}

			return obj;
		},
		getTransform3dByName: function( ele, name, toNumber ) {
			var result = null,
				index;
			if ( hasTransform3d ) {
				var transform = css2.css( ele, transformCssName );

				if ( isFullCss( transform ) ) {
					switch ( name ) {
						case "translateX":
						case "translateY":
						case "translateZ":
							result = getTransformValue( transform, "translate3d" );
							index = transform3dNameMap[ name ];
							break;
						case "rotateX":
						case "rotateY":
						case "rotateZ":
							result = getTransformValue( transform, name );
							index = 1;
							break;
						case "scaleX":
						case "scaleY":
							result = getTransformValue( transform, "scale" );
							index = transform3dNameMap[ name ];
							break;
					}
				}
			}

			return result && result.length ? ( toNumber === true ? parseFloat( result[ index ] ) : result[ index ] ) : null;
		},
		getTransformOrigin: function( ele ) {
			var result = {};
			if ( hasTransform ) {
				var origin = ele.style[ transformCssName + "Origin" ];
				if ( origin ) {
					origin = origin.split( " " );
					result.x = origin[ 0 ];
					result.y = origin[ 1 ];
				}
			}
			return result;
		},
		getTransition: function( ele, name ) {
			var result = [];
			if ( hasTransform ) {
				var transition = css2.css( ele, transitionCssName ),
					temp, index = -1;
				if ( isFullCss( transition ) ) {
					if ( typed.isString( name ) ) {
						temp = getTransitionValue( transition, name );

						result.push( temp );
						result[ name ] = temp;
					} else {
						result = getTransitionValues( transition );
					}
				}
			}
			return result;
		},

		initTransform3d: function( ele, perspective, perspectiveOrigin ) {
			if ( hasTransform3d ) {
				var style = ele.style;
				style[ vendorPropName( style, "TransformStyle" ) ] = "preserve-3d";
				style[ vendorPropName( style, "Perspective" ) ] = perspective || 300;
				style[ vendorPropName( style, "PerspectiveOrigin" ) ] = perspectiveOrigin || "50% 50%";
			}
			return this;
		},

		linearGradient: createLinearGradient( "linearGradient" ),

		repeatingLinearGradient: createLinearGradient( "repeatingLinearGradient" ),
		//https://developer.mozilla.org/en-US/docs/Web/CSS/radial-gradient
		radialGradient: createRadialGradient( "radialGradient" ),
		removeTransition: function( ele, style ) {
			var list, transition = css2.css( ele, transitionCssName ),
				match, n = arguments[ 2 ] || "";
			if ( style == undefined ) {
				transition = "";
			} else if ( typed.isString( style ) ) {
				list = [ style ];
			} else if ( array.inArray( style ) ) {
				list = style;
			} else if ( typed.isObject( style ) ) {
				list = style.name && [ style.name ];
			}

			$.each( list, function( item ) {
				match = transition.match( ( item || item.name ) + ".+?(\\D,|[^,]$)" );
				if ( match ) {
					if ( n && match[ 1 ] && match[ 1 ].indexOf( "," ) > -1 ) {
						n += ",";
					}
					transition = transition.replace( match[ 0 ], n );
				}
			} );
			return css2.css( ele, transitionCssName, transition );
		},
		replaceTransition: function( ele, name, value ) {
			return $.removeTransition( ele, name, value );
		},

		setRotate3d: function( ele, obj ) {
			if ( !obj || !hasTransform3d ) return this;

			var origin = $.getTransform3d( ele ),
				temp = {
					rotateX: origin.rotateX,
					rotateY: origin.rotateY,
					rotateZ: origin.rotateZ
				};
			utilExtend.easyExtend( obj, temp );

			ele.style[ transformCssName ] = editRotate3d( obj ).join( "" );
		},
		setScale: function( ele, obj ) {
			if ( !obj || !hasTransform3d ) return this;

			var origin = $.getTransform3d( ele ),
				temp = {
					scaleX: origin.scaleX,
					scaleY: origin.scaleY
				};
			utilExtend.easyExtend( obj, temp );

			css2.css( ele, transformCssName, editScale( obj ).join( "" ) );
			return this;
		},
		setTransform: function( ele, style ) {
			if ( hasTransform && typed.isArray( style ) ) {
				var result = [];

				$.each( style, function( value, index ) {
					if ( transformReg[ value[ 0 ] ] ) {
						result.push( value[ 0 ], "(", value.slice( 1, value.length ).join( "," ), ") " );
					}
				}, this );

				css2.css( ele, transformCssName, result.join( "" ) );
			}
			return this;
		},
		setTransform3d: function( ele, obj ) {
			if ( !obj || !hasTransform3d ) return this;
			obj = utilExtend.extend( $.getTransform3d( ele ), obj );
			css2.css( ele, transformCssName, editTranslate3d( obj ).concat( editRotate3d( obj ) ).concat( editScale( obj ) ).join( "" ) );
			return this;
		},
		setTransformByCurrent: function( ele, style ) {
			if ( hasTransform && style ) {
				var transform = $.getTransform( ele ),
					pushList = [],
					len1 = style.length,
					len2 = transform.length,
					len3 = 0,
					item1 = null,
					item2 = null,
					item3 = null,
					i = len1 - 1,
					j = len2 - 1,
					z = 0;

				for ( ; i > -1; i-- ) {
					item1 = style[ i ];
					if ( transformReg[ item1[ 0 ] ] ) {
						for ( ; j > -1; j-- ) {
							item2 = transform[ j ];
							if ( item1[ 0 ] == item2[ 0 ] ) {
								z = 1;
								len3 = item1.length;
								for ( ; z < len3; z++ ) {
									item3 = item1[ z ];
									if ( !typed.isEmpty( item3 ) )
										item2[ z ] = item3;
								}
								break;
							}
						}
						if ( z == 0 ) {
							pushList.push( item1 );
						}
						z = 0;
					} else {
						style.splice( i, 1 );
					}
				}


				transform = transform.concat( pushList );

				// $.each(style, function (value) {
				//     transform.push(value)
				// });

				$.setTransform( ele, transform );
			}
			return this;
		},
		setTransformOrigin: function( ele, style ) {
			if ( hasTransform && style ) {
				css2.css( ele, transformCssName + "Origin", [ style.x || "left", " ", style.y || "top" ].join( "" ) );
			}
			return this;
		},
		setTransition: function( ele, style ) {
			if ( hasTransition ) {
				var result = "",
					origin = arguments[ 2 ] ? arguments[ 2 ] : "";
				if ( typed.isString( style ) ) {
					result = style;
				} else if ( typed.isObject( style ) ) {
					style.name && ( result = [ $.util.unCamelCase( value.name, value.head ), style.duration || "1s", style[ "function" ] || "linear", style.delay || ""
          ].join( " " ) );
				} else if ( typed.isArray( style ) ) {
					var list = [];
					$.each( style, function( value ) {
						if ( typed.isString( value ) ) {
							list.push( value );
						} else if ( typed.isObject( value ) ) {
							value.name && list.push( [ $.util.unCamelCase( value.name, value.head ), value.duration || "1s", value[ "function" ] || "linear", value.delay || ""
              ].join( " " ) );
						}
					} );
					result = list.join( "," );
				}
				if ( origin.replace( /\s/g, "" ).indexOf( result.replace( /\s/g, "" ) ) < 0 ) {
					css2.css( ele, transitionCssName, ( origin ? origin + "," : "" ) + result );
				}
			}
			return this;
		},
		setTranslate3d: function( ele, obj ) {
			if ( !obj || !hasTransform3d ) return this;
			var origin = $.getTransform3d( ele ),
				temp = {
					translateX: origin.translateX,
					translateY: origin.translateY,
					translateZ: origin.translateZ
				};
			utilExtend.easyExtend( obj, temp );

			css2.css( ele, transformCssName, editTranslate3d( obj ).join( "" ) );
			return this;
		},
		vendorPropName: function( ele, name ) {
			return vendorPropName( ele.style, name ) || name;
		}
	};
	utilExtend.easyExtend( support, css3Support );
	$.extend( css3 );
	$.fn.extend( {
		addTransition: function( style ) {
			return this.each( function( ele ) {
				$.addTransition( ele, style );
			} );
		},
		bindTransition: function( style ) {
			return this.each( function( ele ) {
				$.bindTransition( ele, style );
			} );
		},
		css3: function( style, value ) {
			if ( !hasCss3 ) {
				return this;
			}
			var b = style,
				tmp;
			if ( typed.isObject( b ) ) {
				for ( var i in b ) {
					this.each( function( ele ) {
						$.css3( ele, i, b[ i ] );
					} );
				}
			} else if ( typed.isString( b ) ) {
				if ( value === undefined ) {
					return $.css3( this[ 0 ], b );
				} else {
					this.each( function( ele ) {
						$.css3( ele, b, value );
					} );
				}
			}
			return this;
		},
		css3Style: function( name ) {
			return css2.style( this[ 0 ], name, css3Head );
		},

		initTransform3d: function( perspective, perspectiveOrigin ) {
			return this.each( function( ele ) {
				$.initTransform3d( ele, perspective, perspectiveOrigin );
			} );
		},

		linearGradient: function( option ) {
			return this.each( function( ele ) {
				$.linearGradient( ele, option );
			} );
		},

		radialGradient: function( option ) {
			return this.each( function( ele ) {
				$.radialGradient( ele, option );
			} );
		},
		removeTransition: function( style ) {
			return this.each( function( ele ) {
				$.removeTransition( ele, style );
			} );
		},
		replaceTransition: function( name, value ) {
			return this.each( function( ele ) {
				$.replaceTransition( ele, name, value );
			} );
		},
		setRotate3d: function( obj ) {
			this.each( function( ele ) {
				$.setRotate3d( ele, obj )
			} );
		},
		setScale: function( obj ) {
			return this.each( function( ele ) {
				$.setScale( ele, obj );
			} );
		},
		setTransformByCurrent: function( style ) {
			return this.each( function( ele ) {
				$.setTransformByCurrent( ele, style );
			} );
		},
		setTransition: function( style ) {
			return this.each( function( ele ) {
				$.setTransition( ele, style );
			} );
		},
		setTranslate3d: function( obj ) {
			return this.each( function( ele ) {
				$.setTranslate3d( ele, obj );
			} );
		},

		transform: function( style ) {
			return typed.isArray( style ) ? this.each( function( ele ) {
				$.setTransform( ele, style );
			} ) : $.getTransform( this[ 0 ], style );
		},
		transform3d: function( obj, toNumber ) {
			if ( hasTransform3d ) {
				switch ( typeof obj ) {
					case "boolean":
						toNumber = obj;
						return $.getTransform3d( this[ 0 ], toNumber );
					case "undefined":
						return $.getTransform3d( this[ 0 ], toNumber );
					case "string":
						return $.getTransform3dByName( this[ 0 ], obj, toNumber );
					case "object":
						return this.each( function( ele ) {
							$.setTransform3d( ele, obj );
						} );
				}
			} else {
				return this;
			}
		},
		transformOrigin: function( style ) {
			return style ? this.each( function( ele ) {
				$.setTransformOrigin( ele, style );
			} ) : $.getTransformOrigin( this[ 0 ] );
		},
		transition: function( style ) {
			if ( style == undefined || typed.isString( style ) && style.indexOf( " " ) < 0 ) {
				return $.getTransition( this[ 0 ], style );
			} else if ( typed.isArray( style ) || typed.isObject( style ) || typed.isString( style ) ) {
				return this.bindTransition( style );
			}
		}
	} );

	css3Hooks.linearGradient.set = css3.linearGradient;

	css3Hooks.repeatingLinearGradient.set = css3.repeatingLinearGradient;

	css3Hooks.radialGradient.set = css3.radialGradient;

	css3Hooks.repeatingRadialGradient.set = css3.repeatingRadialGradient;

	css3Hooks.transform = {
		set: css3.setTransform,
		get: css3.getTransform
	}

	css3Hooks.transform3d = {
		set: css3.setTransform3d,
		get: css3.getTransform3d
	}

	css3Hooks.transformOrigin = {
		set: css3.setTransformOrigin,
		get: css3.getTransformOrigin
	};

	return css3;
} );