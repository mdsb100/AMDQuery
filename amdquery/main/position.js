aQuery.define( "main/position", [ "base/typed", "base/extend", "base/support", "base/client", "main/css" ], function( $, typed, utilExtend, support, client, css, undefined ) {
	"use strict";
	this.describe( "consult JQuery1.9.1" );
	var rnumnonpx = /^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i,
		rnumsplit = new RegExp( "^(" + $.core_pnum + ")(.*)$", "i" ),
		cssExpand = [ "Top", "Right", "Bottom", "Left" ],
		rdisplayswap = /^(none|table(?!-c[ea]).+)/,
		cssShow = {
			position: "absolute",
			visibility: "hidden",
			display: "block"
		};

	var getStyles = css.getStyles;

	var curCSS = css.curCss;

	function getWidthOrHeight( ele, name, extra ) {
		var valueIsBorderBox = true,
			val = name === "width" ? ele.offsetWidth : ele.offsetHeight,
			styles = getStyles( ele ),
			isBorderBox = support.boxSizing && css.css( ele, "boxSizing", undefined, styles, false ) === "border-box";

		if ( val <= 0 || val == null ) {
			val = curCSS( ele, name, styles );
			if ( val < 0 || val == null ) {
				val = ele.style[ name ];
			}

			// Computed unit is not pixels. Stop here and return.
			if ( rnumnonpx.test( val ) ) {
				return val;
			}

			// we need the check for style in case a browser which returns unreliable values
			// for getComputedStyle silently falls back to the reliable ele.style
			valueIsBorderBox = isBorderBox && ( support.boxSizingReliable || val === ele.style[ name ] );

			// Normalize "", auto, and prepare for extra
			val = parseFloat( val ) || 0;
		}

		return ( val +
			augmentWidthOrHeight(
				ele,
				name,
				extra || ( isBorderBox ? "border" : "content" ),
				valueIsBorderBox,
				styles ) ) + "px";
	}

	function setPositiveNumber( elem, value, subtract ) {
		var matches = rnumsplit.exec( value );
		return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
			value;
	}

	function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
		var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

			val = 0;

		for ( ; i < 4; i += 2 ) {
			// both box models exclude margin, so add it if we want it
			if ( extra === "margin" ) {
				val += css.css( elem, extra + cssExpand[ i ], undefined, styles, true );
			}

			if ( isBorderBox ) {
				// border-box includes padding, so remove it if we want content
				if ( extra === "content" ) {
					val -= css.css( elem, "padding" + cssExpand[ i ], undefined, styles, true );
				}

				// at this point, extra isn't border nor margin, so remove border
				if ( extra !== "margin" ) {
					val -= css.css( elem, "border" + cssExpand[ i ] + "Width", undefined, styles, true );
				}
			} else {
				// at this point, extra isn't content, so add padding
				val += css.css( elem, "padding" + cssExpand[ i ], undefined, styles, true );

				// at this point, extra isn't content nor padding, so add border
				if ( extra !== "padding" ) {
					val += css.css( elem, "border" + cssExpand[ i ] + "Width", undefined, styles, true );
				}
			}
		}

		return val;
	}

	function getSize( ele, name, extra ) {
		extra = extra || "content";
		return ele.offsetWidth === 0 && rdisplayswap.test( css.css( ele, "display" ) ) ?
			css.swap( ele, cssShow, function() {
				return getWidthOrHeight( ele, name, extra );
			} ) : getWidthOrHeight( ele, name, extra );
	}

	function setSize( ele, name, value, extra ) {
		extra = extra || "content";
		var style = getStyles( ele );
		return setPositiveNumber( ele, value, extra ?
			augmentWidthOrHeight(
				ele,
				name,
				extra,
				support.boxSizing && css.css( ele, "boxSizing", undefined, style, false ) === "border-box",
				style ) : 0 );
	}

	var position = {
		/**
		 * Get size of page. { width: pageWidth, height: pageHeight }
		 * @returns {Object}
		 */
		getPageSize: function() {
			var pageH = window.innerHeight,
				pageW = window.innerWidth;
			if ( !typed.isNumber( pageW ) ) {
				if ( document.compatMode == "CSS1Compat" ) {
					pageH = document.documentElement.clientHeight;
					pageW = document.documentElement.clientWidth;
				} else {
					pageH = document.body.clientHeight;
					pageW = document.body.clientWidth;
				}
			}
			return {
				width: pageW,
				height: pageH
			};
		},
		/**
		 * Get height from element.
		 * @param {Element}
		 * @returns {Number}
		 */
		getHeight: function( ele ) {
			return position.getWidth( ele, "height" );
		},
		/**
		 * Get width from element.
		 * @param {Element}
		 * @returns {Number}
		 */
		getWidth: function( ele ) {
			var name = arguments[ 1 ] ? "height" : "width",
				bName = name == "width" ? "Width" : "Height";
			if ( typed.isWindow( ele ) ) {
				return ele.document.documentElement[ "client" + bName ];
			}

			// Get document width or height
			if ( ele.nodeType === 9 ) {
				var doc = ele.documentElement;

				// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest
				// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.
				return Math.max(
					ele.body[ "scroll" + bName ], doc[ "scroll" + bName ],
					ele.body[ "offset" + bName ], doc[ "offset" + bName ],
					doc[ "client" + bName ] );
			}
			return css.css( ele, name );
		},
		/**
		 * Get top from element.
		 * @param {Element}
		 * @returns {Number}
		 */
		getTop: function( ele ) {
			var t = ele.offsetTop || 0,
				cur = ele.offsetParent;
			while ( cur != null ) {
				t += cur.offsetTop;
				cur = cur.offsetParent;
			}
			return t;
		},
		/**
		 * Get left from element.
		 * @param {Element}
		 * @returns {Number}
		 */
		getLeft: function( ele ) {
			var l = ele.offsetLeft || 0,
				cur = ele.offsetParent;
			while ( cur != null ) {
				l += cur.offsetLeft;
				cur = cur.offsetParent;
			}
			return l;
		},
		/**
		 * Get offset left from element.
		 * @param {Element}
		 * @returns {Number}
		 */
		getOffsetL: function( ele ) {
			return ele.offsetLeft;
		},
		/**
		 * Get offset top from element.
		 * @param {Element}
		 * @returns {Number}
		 */
		getOffsetT: function( ele ) {
			/// <summary>返回元素的顶边距离
			/// <para>top:相对于显示部分</para>
			/// </summary>
			/// <returns type="Number" />
			return ele.offsetTop;
		},
		/**
		 * Get inner height from element.
		 * @param {Element}
		 * @returns {Number}
		 */
		getInnerH: function( ele ) {
			/// <summary>返回元素的内高度
			/// </summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <returns type="Number" />
			return parseFloat( getSize( ele, "height", "padding" ) );
		},
		/**
		 * Get inner width from element.
		 * @param {Element}
		 * @returns {Number}
		 */
		getInnerW: function( ele ) {
			/// <summary>返回元素的内宽度
			/// </summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <returns type="Number" />
			return parseFloat( getSize( ele, "width", "padding" ) );
		},
		/**
		 * Get outer height from element.
		 * @param {Element}
		 * @returns {Number}
		 */
		getOuterH: function( ele, bol ) {
			/// <summary>返回元素的外高度
			/// </summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <param name="bol" type="bol">margin是否计算在内</param>
			/// <returns type="Number" />
			return parseFloat( getSize( ele, "height", bol === true ? "margin" : "border" ) );
		},
		/**
		 * Get outer width from element.
		 * @param {Element}
		 * @returns {Number}
		 */
		getOuterW: function( ele, bol ) {
			/// <summary>返回元素的外宽度
			/// </summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <param name="bol" type="bol">margin是否计算在内</param>
			/// <returns type="Number" />
			return parseFloat( getSize( ele, "width", bol === true ? "margin" : "border" ) );
		},
		/**
		 * Set height to element.
		 * @param {Element}
		 * @param {Number|String}
		 * @returns {this}
		 */
		setHeight: function( ele, value ) {
			return position.setWidth( ele, value, "height" );
		},
		/**
		 * Set width to element.
		 * @param {Element}
		 * @param {Number|String}
		 * @returns {this}
		 */
		setWidth: function( ele, value ) {
			/// <summary>设置元素的宽度
			/// </summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="value" type="Number/String">值</param>
			/// <returns type="self" />
			var name = arguments[ 2 ] ? "height" : "width";

			css.css( ele, name, value );

			return this;
		},
		/**
		 * Set inner height to element.
		 * @param {Element}
		 * @param {Number|String}
		 * @returns {this}
		 */
		setInnerH: function( ele, height ) {
			ele.style.height = setSize( ele, "height", height, "padding" );
			return this;
		},
		/**
		 * Set inner width to element.
		 * @param {Element}
		 * @param {Number|String}
		 * @returns {this}
		 */
		setInnerW: function( ele, width ) {
			ele.style.width = setSize( ele, "width", width, "padding" );
			return this;
		},
		/**
		 * Set offset left to element.
		 * @param {Element}
		 * @param {Number|String}
		 * @returns {this}
		 */
		setOffsetL: function( ele, left ) {
			switch ( typeof left ) {
				case "number":
					left += "px";
					ele.style.left = left;
					break;
				case "string":
					ele.style.left = left;
					break;
			}
			return this;
		},
		/**
		 * Set inner top to element.
		 * @param {Element}
		 * @param {Number|String}
		 * @returns {this}
		 */
		setOffsetT: function( ele, top ) {
			switch ( typeof top ) {
				case "number":
					top += "px";
					ele.style.top = top;
					break;
				case "string":
					ele.style.top = top;
					break;
			}

			return this;
		},
		/**
		 * Set outer height to element.
		 * @param {Element}
		 * @param {Number|String}
		 * @param {Boolean} - If true is "margin" else then border
		 * @returns {this}
		 */
		setOuterH: function( ele, height, bol ) {
			ele.style.height = setSize( ele, "height", height, bol === true ? "margin" : "border" );
			return this;
		},
		/**
		 * Set outer width to element.
		 * @param {Element}
		 * @param {Number|String}
		 * @param {Boolean} - If true is "margin" else then border
		 * @returns {this}
		 */
		setOuterW: function( ele, width, bol ) {
			ele.style.width = setSize( ele, "width", width, bol === true ? "margin" : "border" );
			return this;
		}
	};

	$.fn.extend( {
		/*
		 * Set width to Element.
		 * @variation 1
		 * @method width
		 * @memberOf aQuery.prototype
		 * @param width {Number|String}
		 * @returns {this}
		 */

		/**
		 * Get first Element width.
		 * @returns {Number}
		 */
		width: function( width ) {
			return typed.isNul( width ) ? parseFloat( position.getWidth( this[ 0 ] ) ) : this.each( function( ele ) {
				position.setWidth( ele, width );
			} );
		},
		/*
		 * Set height to Element.
		 * @variation 1
		 * @method height
		 * @memberOf aQuery.prototype
		 * @param height {Number|String}
		 * @returns {this}
		 */

		/**
		 * Get first Element height.
		 * @returns {Number}
		 */
		height: function( height ) {
			return typed.isNul( height ) ? parseFloat( position.getHeight( this[ 0 ] ) ) : this.each( function( ele ) {
				position.setHeight( ele, height );
			} );
		},
		/**
		 * Get left from first Element.
		 * @returns {Number}
		 */
		getLeft: function() {
			return position.getLeft( this[ 0 ] );
		},
		/**
		 * Get top from first Element.
		 * @returns {Number}
		 */
		getTop: function() {
			return position.getTop( this[ 0 ] );
		},
		/*
		 * Set offset left to Element.
		 * @variation 1
		 * @method offsetLeft
		 * @memberOf aQuery.prototype
		 * @param left {Number|String}
		 * @returns {this}
		 */

		/**
		 * Get offset left from first Element.
		 * @returns {Number}
		 */
		offsetLeft: function( left ) {
			return !typed.isNul( left ) ? this.each( function( ele ) {
				position.setOffsetL( ele, left );
			} ) : position.getOffsetL( this[ 0 ] );
		},
		/*
		 * Set offset top to Element.
		 * @variation 1
		 * @method offsetTop
		 * @memberOf aQuery.prototype
		 * @param top {Number|String}
		 * @returns {this}
		 */

		/**
		 * Get offset top from first Element.
		 * @returns {Number}
		 */
		offsetTop: function( top ) {
			return !typed.isNul( top ) ? this.each( function( ele ) {
				position.setOffsetT( ele, top );
			} ) : position.getOffsetT( this[ 0 ] );
		},
		/*
		 * Set inner height to Element.
		 * @variation 1
		 * @method innerHeight
		 * @memberOf aQuery.prototype
		 * @param height {Number|String}
		 * @returns {this}
		 */

		/**
		 * Get first Element inner height.
		 * @returns {Number}
		 */
		innerHeight: function( height ) {
			return !typed.isNul( height ) ? this.each( function( ele ) {
				position.setInnerH( ele, height );
			} ) : position.getInnerH( this[ 0 ] );
		},
		/*
		 * Set inner width to Element.
		 * @variation 1
		 * @method innerWidth
		 * @memberOf aQuery.prototype
		 * @param width {Number|String}
		 * @returns {this}
		 */

		/**
		 * Get first Element inner width.
		 * @returns {Number}
		 */
		innerWidth: function( width ) {
			return !typed.isNul( width ) ? this.each( function( ele ) {
				position.setInnerW( ele, width );
			} ) : position.getInnerW( this[ 0 ] );
		},
		/*
		 * Set outer height to Element.
		 * @variation 1
		 * @method outerHeight
		 * @memberOf aQuery.prototype
		 * @param height {Number|String}
		 * @param [bol] {Boolean} - If true then contains "margin"
		 * @returns {this}
		 */

		/**
		 * Get first Element outer height.
		 * @param [bol] {Boolean} - If true then contains "margin"
		 * @returns {Number}
		 */
		outerHeight: function( height, bol ) {
			if ( arguments.length == 1 && typed.isBoolean( height ) ) {
				bol = height;
				height = null;
			}
			return typed.isNul( height ) ? position.getOuterH( this[ 0 ], bol ) : this.each( function( ele ) {
				position.setOuterH( ele, height, bol );
			} );
		},
		/*
		 * Set outer width to Element.
		 * @variation 1
		 * @method outerWidth
		 * @memberOf aQuery.prototype
		 * @param width {Number|String}
		 * @param [bol] {Boolean} - If true then contains "margin"
		 * @returns {this}
		 */

		/**
		 * Get first Element outer width.
		 * @param [bol] {Boolean} - If true then contains "margin"
		 * @returns {Number}
		 */
		outerWidth: function( width, bol ) {
			if ( arguments.length == 1 && typed.isBoolean( width ) ) {
				bol = width;
				width = null;
			}
			return typed.isNul( width ) ? position.getOuterW( this[ 0 ], bol ) : this.each( function( ele ) {
				position.setOuterW( ele, width, bol );
			} );
		},
		/**
		 * Get first Element scroll height.
		 * @returns {Number}
		 */
		scrollHeight: function() {
			var height = this.height();
			return css.swap( this[ 0 ], {
				"overflow": "scroll"
			}, function() {
				return Math.max( height, this.scrollHeight || 0 );
			} );
		},
		/**
		 * Get first Element scroll width.
		 * @returns {Number}
		 */
		scrollWidth: function() {
			var width = this.width();
			return css.swap( this[ 0 ], {
				"overflow": "scroll"
			}, function() {
				return Math.max( width, this.scrollWidth || 0 );
			} );
		}

	} );

	utilExtend.extend( true, css.cssHooks, {
		"width": {
			"get": getSize,
			"set": setSize
		},
		"height": {
			"get": getSize,
			"set": setSize
		}
	} );


	return position;
} );