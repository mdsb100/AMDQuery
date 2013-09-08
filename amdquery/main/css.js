aQuery.define( "main/css", [ "base/typed", "base/extend", "base/array", "base/support", "base/client", "main/data", "main/query" ], function( $, typed, utilExtend, utilArray, support, client, data, query, undefined ) {
	"use strict"; //启用严格模式
	var rnumnonpx = /^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i,
		rmargin = /^margin/,
		rposition = /^(top|right|bottom|left)$/,
		rrelNum = new RegExp( "^([+-])=(" + $.reg.core_pnum + ")", "i" ),
		cssNumber = {
			"columnCount": true,
			"fillOpacity": true,
			"fontWeight": true,
			"lineHeight": true,
			"opacity": true,
			"orphans": true,
			"widows": true,
			"zIndex": true,
			"zoom": true
		};

	var getStyles,
		curCSS,
		cssProps = {
			float: support.cssFloat ? "cssFloat" : "styleFloat"
		};

	if ( window.getComputedStyle ) {
		//quote from jquery1.9.0
		getStyles = function( elem ) {
			return window.getComputedStyle( elem, null );
		};

		curCSS = function( ele, name, _computed ) {
			var width, minWidth, maxWidth,
				computed = _computed || getStyles( ele ),
				// getPropertyValue is only needed for .css("filter") in IE9, see #12537
				ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined,
				style = ele.style;

			if ( computed ) {

				if ( ret === "" && !$.contains( ele.ownerDocument.documentElement, ele ) ) {
					ret = $.style( ele, name );
				}

				// A tribute to the "awesome hack by Dean Edwards"
				// Chrome < 17 and Safari 5.0 uses "computed value" instead of "used value" for margin-right
				// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
				// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
				if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

					// Remember the original values
					width = style.width;
					minWidth = style.minWidth;
					maxWidth = style.maxWidth;

					// Put in the new values to get a computed value out
					style.minWidth = style.maxWidth = style.width = ret;
					ret = computed.width;

					// Revert the changed values
					style.width = width;
					style.minWidth = minWidth;
					style.maxWidth = maxWidth;
				}
			}

			return ret;
		};
	} else if ( document.documentElement.currentStyle ) {
		getStyles = function( ele ) {
			return ele.currentStyle;
		};

		curCSS = function( ele, name, _computed ) {
			var left, rs, rsLeft,
				computed = _computed || getStyles( ele ),
				ret = computed ? computed[ name ] : undefined,
				style = ele.style;

			// Avoid setting ret to empty string here
			// so we don't default to auto
			if ( ret == null && style && style[ name ] ) {
				ret = style[ name ];
			}

			// From the awesome hack by Dean Edwards
			// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

			// If we're not dealing with a regular pixel number
			// but a number that has a weird ending, we need to convert it to pixels
			// but not position css attributes, as those are proportional to the parent element instead
			// and we can't measure the parent instead because it might trigger a "stacking dolls" problem
			if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

				// Remember the original values
				left = style.left;
				rs = ele.runtimeStyle;
				rsLeft = rs && rs.left;

				// Put in the new values to get a computed value out
				if ( rsLeft ) {
					rs.left = ele.currentStyle.left;
				}
				style.left = name === "fontSize" ? "1em" : ret;
				ret = style.pixelLeft + "px";

				// Revert the changed values
				style.left = left;
				if ( rsLeft ) {
					rs.left = rsLeft;
				}
			}

			return ret === "" ? "auto" : ret;
		};
	}

	var css = {
		css: function( ele, name, value, style, extra ) {
			/// <summary>为元素添加样式</summary>
			/// <param name="ele" type="Element">元素</param>
			/// <param name="name" type="String">样式名</param>
			/// <param name="value" type="str/num">值</param>
			/// <param name="style" type="Object">样式表</param>
			/// <param name="extra" type="Boolean">是否返回num</param>
			/// <returns type="self" />
			if ( !ele || ele.nodeType === 3 || ele.nodeType === 8 || !ele.style ) {
				return;
			}
			style = style || ele.style;

			var originName = $.util.camelCase( name );

			var hooks = cssHooks[ name ] || {};
			name = $.cssProps[ originName ] || ( $.cssProps[ originName ] = css.vendorPropName( style, originName ) );

			if ( value == undefined ) {
				var val = hooks.get ? hooks.get( ele, name ) : curCSS( ele, name, style );
				if ( extra === "" || extra ) {
					var num = parseFloat( val );
					return extra === true || typed.isNumeric( num ) ? num || 0 : val;
				}
				return val;

			} else {
				var type = typeof value,
					ret;

				// convert relative number strings (+= or -=) to relative numbers. #7345
				if ( type === "string" && ( ret = rrelNum.exec( value ) ) ) {
					value = ( ret[ 1 ] + 1 ) * ret[ 2 ] + parseFloat( $.css( ele, name ) );
					type = "number";
				}

				// Make sure that NaN and null values aren't set. See: #7116
				if ( value == null || type === "number" && isNaN( value ) ) {
					return;
				}

				//If a number was passed in, add 'px' to the (except for certain CSS properties)
				if ( type === "number" && !cssNumber[ originName ] ) {
					value += "px";
				}

				if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
					style[ name ] = "inherit";
				}

				if ( !hooks || !( "set" in hooks ) || ( value = hooks.set( ele, name, value ) ) !== undefined ) {
					try {
						style[ name ] = value;
					} catch ( e ) {}
				}

				// hooks["set"] ? hooks["set"].call($, ele, value) : (style[name] = value);

				return this;
			}
		},
		curCss: curCSS,
		cssProps: cssProps,
		style: function( ele, type, head ) {
			/// <summary>返回元素样式表中的某个样式</summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="type" type="String">样式名 缺省返回""</param>
			/// <param name="head" type="String">样式名的头 缺省则无</param>
			/// <returns type="String" />
			return css.styleTable( ele )[ $.util.camelCase( type, head ) ];
		},
		styleTable: function( ele ) {
			/// <summary>返回元素样式表</summary>
			/// <param name="ele" type="Element">dom元素</param>
			/// <returns type="Object" />
			var style;
			if ( document.defaultView && document.defaultView.getComputedStyle ) style = document.defaultView.getComputedStyle( ele, null );
			else {
				style = ele.currentStyle;

			}
			return style;
		},

		contains: query.contains,

		getOpacity: function( ele ) {
			/// <summary>获得ele的透明度</summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <returns type="Number" />

			var o;
			if ( support.opacity ) {
				o = $.styleTable( ele ).opacity;
				if ( o == "" || o == undefined ) {
					o = 1;
				} else {
					o = parseFloat( o );
				}
			} else {
				//return ele.style.filter ? (ele.style.filter.match(/\d+/)[0] / 100) : 1;
				var f = $.styleTable( ele ).filter;
				o = 1;
				if ( f ) {
					o = f.match( /\d+/ )[ 0 ] / 100;
				}

			}
			return o;
		},
		getStyles: getStyles,


		hide: function( ele, visible ) {
			/// <summary>隐藏元素</summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="visible" type="Boolean">true:隐藏后任然占据文档流中</param>
			/// <returns type="self" />
			if ( visible ) {
				ele.style.visibility = "hidden";
			} else {
				ele.style.dispaly && $.data( ele, "_visible_display", ele.style.dispaly );
				ele.style.display = "none";
			}

			//a ? this.css({ vi: "hidden" }) : this.css({ d: "none" })
			return this;
		},

		isVisible: function( ele ) {
			/// <summary>返回元素是否可见</summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <returns type="Boolean" />
			var t = $.styleTable( ele );
			if ( t.display == "none" ) {
				return false;
			}
			if ( t.visibility == "hidden" ) {
				return false;
			}
			return true;
		},

		setOpacity: function( ele, alpha ) {
			/// <summary>改变ele的透明度
			/// </summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <param name="alpha" type="Number">0-1</param>
			/// <returns type="self" />
			alpha = $.between( 0, 1, alpha );
			if ( support.opacity ) ele.style.opacity = alpha;
			else ele.style.filter = "Alpha(opacity=" + ( alpha * 100 ) + ")"; //progid:DXImageTransform.Microsoft.
			return this;
		},
		show: function( ele ) {
			/// <summary>显示元素</summary>
			/// <param name="ele" type="Element">element元素</param>
			/// <returns type="self" />
			var s = ele.style,
				n = "none",
				h = "hidden",
				nEle, v;
			if ( $.curCss( ele, "display" ) == n ) {
				v = $.data( ele, "_visible_display" );
				if ( !v ) {
					nEle = $.createEle( ele.tagName );
					if ( ele.parentNode ) {
						document.body.appendChild( nEle );
					}
					v = $.curCss( nEle, "display" ) || "";
					document.body.removeChild( nEle );
					nEle = null;
				}

				s.display = v;
			}
			if ( $.curCss( ele, "visibility" ) == h ) {
				s.visibility = "visible";
			}

			return this;
		},
		swap: function( ele, options, callback, args ) {
			var ret, name,
				old = {},
				style = ele.style;

			// Remember the old values, and insert the new ones

			for ( name in options ) {
				old[ name ] = style[ name ];
				style[ name ] = options[ name ];
			}

			ret = callback.apply( ele, args || [ ] );

			// Revert the old values
			utilExtend.easyExtend( style, old );

			return ret;
		}
	};

	$.fn.extend( {
		css: function( style, value ) {
			/// <summary>添加或获得样式
			/// <para>如果要获得样式 返回为String</para>
			/// <para>fireFox10有个问题，请不要写成带-的形式</para>
			/// </summary>
			/// <param name="style" type="Object/String">obj为赋样式 str为获得一个样式</param>
			/// <param name="value" type="String/Number/undefined">当style是字符串，并且value存在</param>
			/// <returns type="self" />
			// var result, tmp;
			if ( typed.isObj( style ) ) {
				for ( var key in style ) {
					this.each( function( ele ) {
						$.css( ele, key, style[ key ] );
					} );
				}
			} else if ( typed.isStr( style ) ) {
				if ( value === undefined ) {
					return $.css( this[ 0 ], style );
				} else {
					this.each( function( ele ) {
						$.css( ele, style, value );
					} );
				}
			}
			return this;
		},
		curCss: function( name ) {
			/// <summary>返回样式原始值 可能有bug</summary>
			/// <param name="name" type="String">样式名</param>
			/// <returns type="any" />
			return $.curCss( this[ 0 ], name );
		},
		style: function( type, head ) {
			/// <summary>返回第一个元素样式表中的某个样式</summary>
			/// <param name="type" type="String">样式名 缺省返回""</param>
			/// <param name="head" type="String">样式名的头 缺省则无</param>
			/// <returns type="String" />

			return $.style( this[ 0 ], type, head );
		},
		styleTable: function( ) {
			/// <summary>返回第一个元素样式表</summary>
			/// <returns type="Object" />
			return $.styleTable( this[ 0 ] );
		},

		antonymVisible: function( a ) {
			/// <summary>添加兼容滚轮事件</summary>
			/// <param name="a" type="Boolean">如果隐藏，隐藏的种类，true表示任然占据文档流</param>
			/// <returns type="self" />
			if ( this.isVisible( ) ) this.hide( a );
			else this.show( );
			return this;
		},

		hide: function( visible ) {
			/// <summary>设置所有元素隐藏</summary>
			/// <param name="visible" type="Boolean">true:隐藏后任然占据文档流中</param>
			/// <returns type="self" />
			//            a ? this.css({ vi: "hidden" }) : this.css({ d: "none" })
			//            return this;
			return this.each( function( ele ) {
				$.hide( ele, visible );
			} );
		},

		insertText: function( str ) {
			/// <summary>给当前对象的所有ele插入TextNode</summary>
			/// <param name="str" type="String">字符串</param>
			/// <returns type="self" />
			if ( typed.isStr( str ) && str.length > 0 ) {
				var nodeText;
				this.each( function( ele ) {
					nodeText = document.createTextNode( str );
					ele.appendChild( nodeText );
				} );
			}
			return this;
		},
		isVisible: function( ) {
			/// <summary>返回元素是否可见</summary>
			/// <returns type="Boolean" />
			//            if (this.css("visibility") == "hidden")
			//                return false;
			//            if (this.css("d") == "none")
			//                return false;
			// return true;
			return $.isVisible( this[ 0 ] );
		},

		opacity: function( alpha ) {
			/// <summary>设置当前对象所有元素的透明度或获取当前对象第一个元素的透明度
			/// <para>获得时返回Number</para>
			/// </summary>
			/// <param name="alpha" type="Number/null">透明度（0~1）可选，为空为获取透明度</param>
			/// <returns type="self" />
			return typed.isNum( alpha ) ? this.each( function( ele ) {
				$.setOpacity( ele, alpha );
			} ) : $.getOpacity( this[ 0 ] );
		},

		show: function( ) {
			/// <summary>显示所有元素</summary>
			/// <returns type="self" />
			//            if (this.css("visibility") == "hidden")
			//                this.css({ vi: "visible" });
			//            else if (this.css("d") == "none")
			//                this.css({ d: "" });
			//            return this;
			return this.each( function( ele ) {
				$.show( ele );
			} );
		}

	} );

	var cssHooks = {
		"opacity": {
			"get": css.getOpacity,
			"set": function( ele, name, value ) {
				css.setOpacity( ele, value );
			}
		}
	};

	if ( !support.reliableMarginRight ) {
		cssHooks.marginRight = {
			get: function( elem ) {
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// Work around by temporarily setting element display to inline-block
				return css.swap( elem, {
						"display": "inline-block"
					},
					curCSS, [ elem, "marginRight" ] );
			}
		};
	}

	css.cssHooks = cssHooks;

	$.extend( css );

	// do not extend $
	css.vendorPropName = function( style, name ) {
		return name;
	};

	$.interfaces.achieve( "constructorCSS", function( type, dollar, cssObj, ele, parentNode ) {
		cssObj && dollar.css( cssObj );
		parentNode && ( typed.isEle( parentNode ) || typed.is$( parentNode ) ) && dollar.appendTo( parentNode );
	} );

	return css;
}, "consult JQuery1.9.1" );