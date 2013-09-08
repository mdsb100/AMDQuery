aQuery.define( "main/position", [ "base/typed", "base/extend", "base/support", "base/client", "main/css" ], function( $, typed, utilExtend, support, client, css, undefined ) {
	"use strict"; //启用严格模式
	var rnumnonpx = /^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i,
		rnumsplit = new RegExp( "^(" + $.reg.core_pnum + ")(.*)$", "i" ),
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
			$.swap( ele, cssShow, function( ) {
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
    getPageSize: function( ) {
      /// <summary>返回页面大小
      /// <para>obj.width</para>
      /// <para>obj.height</para>
      /// </summary>
      /// <returns type="Object" />
      var pageH = window.innerHeight,
        pageW = window.innerWidth;
      if ( !typed.isNum( pageW ) ) {
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

		getHeight: function( ele ) {
			/// <summary>获得元素的高度
			/// </summary>
			//  <param name="ele" type="Element">element元素</param>
			/// <returns type="Number" />
			return position.getWidth( ele, "height" );
		},
		getWidth: function( ele ) {
			/// <summary>获得元素的宽度
			/// </summary>
			//  <param name="ele" type="Element">element元素</param>
			/// <returns type="Number" />
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

		getTop: function( ele ) {
			/// <summary>获得元素离上边框的总长度</summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <returns type="Number" />
			var t = ele.offsetTop || 0,
				cur = ele.offsetParent;
			while ( cur != null ) {
				t += cur.offsetTop;
				cur = cur.offsetParent;
			}
			return t;
		},
		getLeft: function( ele ) {
			/// <summary>获得元素离左边框的总长度</summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <returns type="Number" />
			var l = ele.offsetLeft || 0,
				cur = ele.offsetParent;
			while ( cur != null ) {
				l += cur.offsetLeft;
				cur = cur.offsetParent;
			}
			return l;
		},

		getOffsetL: function( ele ) {
			/// <summary>返回元素的左边距离
			/// <para>left:相对于显示部分</para>
			/// </summary>
			/// <returns type="Number" />
			return ele.offsetLeft;
		},
		getOffsetT: function( ele ) {
			/// <summary>返回元素的顶边距离
			/// <para>top:相对于显示部分</para>
			/// </summary>
			/// <returns type="Number" />
			return ele.offsetTop;
		},

		getInnerH: function( ele ) {
			/// <summary>返回元素的内高度
			/// </summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <returns type="Number" />
			return parseFloat( getSize( ele, "height", "padding" ) );
		},
		getInnerW: function( ele ) {
			/// <summary>返回元素的内宽度
			/// </summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <returns type="Number" />
			return parseFloat( getSize( ele, "width", "padding" ) );
		},

		getOuterH: function( ele, bol ) {
			/// <summary>返回元素的外高度
			/// </summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <param name="bol" type="bol">margin是否计算在内</param>
			/// <returns type="Number" />
			return parseFloat( getSize( ele, "height", bol === true ? "margin" : "border" ) );
		},
		getOuterW: function( ele, bol ) {
			/// <summary>返回元素的外宽度
			/// </summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <param name="bol" type="bol">margin是否计算在内</param>
			/// <returns type="Number" />
			return parseFloat( getSize( ele, "width", bol === true ? "margin" : "border" ) );
		},

		position: function( ele ) {
			/// <summary>返回元素的位置及大小;值都是offset
			/// <para>top:相对于父级</para>
			/// <para>left:相对于父级</para>
			/// <para>width:相对于显示部分</para>
			/// <para>height:相对于显示部分</para>
			/// <para>pageTop:相对于dom</para>
			/// <para>pageLeft:相对于dom</para>
			/// <para>scrollWidth:相对于整个大小</para>
			/// <para>scrollHeight:相对于整个大小</para>
			/// </summary>
			/// <returns type="Object" />
			var h = ele.offsetHeight || ele.clientHeight,
				w = ele.offsetWidth || ele.clientWidth;
			return {
				top: ele.offsetTop,
				left: ele.offsetLeft,
				height: h,
				width: w,
				scrollHeight: Math.max( ele.scrollHeight, h ),
				scrollWidth: Math.max( ele.scrollWidth, w ),
				pageLeft: $.getLeft( ele ),
				pageTop: $.getTop( ele )
			};
		},

		setHeight: function( ele, value ) {
			/// <summary>设置元素的高度
			/// </summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="value" type="Number/String">值</param>
			/// <returns type="self" />
			return $.setWidth( ele, value, "height" );
		},
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

		setInnerH: function( ele, height ) {
			/// <summary>设置元素的内高度
			/// <para>height:相对于显示部分</para>
			/// </summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="height" type="Number/String">值</param>
			/// <returns type="self" />
			ele.style.height = setSize( ele, "height", height, "padding" );
			return this;
		},
		setInnerW: function( ele, width ) {
			/// <summary>设置元素的内宽度
			/// <para>width:相对于显示部分</para>
			/// </summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="width" type="Number/String">值</param>
			/// <returns type="self" />
			ele.style.width = setSize( ele, "width", width, "padding" );
			return this;
		},

		setOffsetL: function( ele, left ) {
			/// <summary>设置元素左边距
			/// <para>left:相对于显示部分</para>
			/// <para>单位默认为px</para>
			/// </summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="left" type="Number/String/undefined">值 可缺省 缺省则返回</param>
			/// <returns type="self" />
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
		setOffsetT: function( ele, top ) {
			/// <summary>设置元素左边距
			/// <para>left:相对于显示部分</para>
			/// <para>单位默认为px</para>
			/// </summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="left" type="Number/String/undefined">值 可缺省 缺省则返回</param>
			/// <returns type="self" />
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

		setOuterH: function( ele, height, bol ) {
			/// <summary>设置元素的外高度
			/// </summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="height" type="Number/String">值</param>
			/// <param name="bol" type="Boolean">是否包括margin</param>
			/// <returns type="self" />
			ele.style.height = setSize( ele, "height", height, bol === true ? "margin" : "border" );
			return this;
		},
		setOuterW: function( ele, width, bol ) {
			/// <summary>设置元素的外宽度
			/// </summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="width" type="Number/String">值</param>
			/// <param name="bol" type="Boolean">是否包括margin</param>
			/// <returns type="self" />
			ele.style.width = setSize( ele, "width", width, bol === true ? "margin" : "border" );
			return this;
		}
	};

  $.extend(position);

	$.fn.extend( {
		width: function( width ) {
			/// <summary>返回或设置第一个元素的宽度
			/// </summary>
			/// <param name="width" type="Number/String">宽度</param>
			/// <returns type="Number" />
			return typed.isNul( width ) ? parseFloat( $.getWidth( this[ 0 ] ) ) : this.each( function( ele ) {
				$.setWidth( ele, width );
			} );
		},
		height: function( height ) {
			/// <summary>返回或设置第一个元素的高度
			/// </summary>
			/// <param name="height" type="Number/String">高度</param>
			/// <returns type="Number" />
			return typed.isNul( height ) ? parseFloat( $.getHeight( this[ 0 ] ) ) : this.each( function( ele ) {
				$.setHeight( ele, height );
			} );
		},

		getLeft: function( ) {
			/// <summary>获得第一个元素离左边框的总长度
			/// <para>left:相对于父级</para>
			/// </summary>
			/// <returns type="Number" />
			return $.getLeft( this[ 0 ] );
		},
		getTop: function( ) {
			/// <summary>获得第一个元素离上边框的总长度
			/// <para>left:相对于父级</para>
			/// </summary>
			/// <returns type="Number" />
			return $.getTop( this[ 0 ] );
		},


		offsetLeft: function( left ) {
			/// <summary>获得或设置元素left
			/// <para>为数字时则返回this 设置left</para>
			/// <para>单位默认为px</para>
			/// </summary>
			/// <param name="left" type="num/any">宽度</param>
			/// <returns type="self" />
			return typed.isNum( left ) ? this.each( function( ele ) {
				$.setOffsetL( ele, left );
			} ) : $.getOffsetL( this[ 0 ] );
		},
		offsetTop: function( top ) {
			/// <summary>获得或设置元素top
			/// <para>为数字时则返回this 设置top</para>
			/// <para>单位默认为px</para>
			/// </summary>
			/// <param name="top" type="num/any">宽度</param>
			/// <returns type="self" />
			return typed.isNum( top ) ? this.each( function( ele ) {
				$.setOffsetT( ele, top );
			} ) : $.getOffsetT( this[ 0 ] );
		},


		innerHeight: function( height ) {
			/// <summary>返回或设置第一个元素内高度
			/// </summary>
			/// <param name="height" type="Number">高度</param>
			/// <returns type="Number" />
			return !typed.isNul( height ) ? this.each( function( ele ) {
				$.setInnerH( ele, height );
			} ) : $.getInnerH( this[ 0 ] );
		},
		innerWidth: function( width ) {
			/// <summary>返回第一个元素内宽度
			/// </summary>
			/// <param name="height" type="Number">宽度</param>
			/// <returns type="Number" />
			return !typed.isNul( width ) ? this.each( function( ele ) {
				$.setInnerW( ele, width );
			} ) : $.getInnerW( this[ 0 ] );
		},

		outerHeight: function( height, bol ) {
			/// <summary>返回或设置第一个元素的外高度
			/// </summary>
			/// <param name="height" type="Number">高度</param>
			/// <param name="bol" type="bol">margin是否计算在内</param>
			/// <returns type="Number" />
			if ( arguments.length == 1 && typed.isBol( height ) ) {
				bol = height;
				height = null;
			}
			return typed.isNul( height ) ? $.getOuterH( this[ 0 ], bol ) : this.each( function( ele ) {
				$.setOuterH( ele, height, bol );
			} );
		},
		outerWidth: function( width, bol ) {
			/// <summary>返回或设置第一个元素的外宽度
			/// </summary>
			/// <param name="width" type="Number">宽度</param>
			/// <returns type="Number" />
			if ( arguments.length == 1 && typed.isBol( width ) ) {
				bol = width;
				width = null;
			}
			return typed.isNul( width ) ? $.getOuterW( this[ 0 ], bol ) : this.each( function( ele ) {
				$.setOuterW( ele, width, bol );
			} );
		},

		scrollHeight: function( ) {
			/// <summary>返回第一个元素的高度
			/// <para>Height:相对于整个大小</para>
			/// </summary>
			/// <returns type="Number" />
			if ( client.browser.ie < 8 ) {
				return css.swap( this[ 0 ], {
					"overflow": "scroll"
				}, function( ) {
					return this.scrollHeight || 0;
				} );
			}
			return this[ 0 ].scrollHeight || 0;
		},
		scrollWidth: function( ) {
			/// <summary>返回第一个元素的宽度
			/// <para>Width:相对于整个大小</para>
			/// </summary>
			/// <returns type="Number" />
			return this[ 0 ].scrollWidth || 0;
		},

		position: function( ) {
			/// <summary>返回第一个元素的位置及大小;值都是offset
			/// <para>top:相对于父级</para>
			/// <para>left:相对于父级</para>
			/// <para>width:相对于显示部分</para>
			/// <para>height:相对于显示部分</para>
			/// <para>Top:相对于dom</para>
			/// <para>Left:相对于dom</para>
			/// <para>Width:相对于整个大小</para>
			/// <para>Height:相对于整个大小</para>
			/// </summary>
			/// <returns type="Object" />
			return $.position( this[ 0 ] );
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
}, "consult JQuery1.9.1" );