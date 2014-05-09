aQuery.define( "module/src", [ "base/typed", "base/extend", "base/client", "main/event" ], function( $, typed, utilExtend, client, utilEvent, undefined ) {
	"use strict";
	var
	hasOwnProperty = Object.prototype.hasOwnProperty,
		src = {
			href: function( ele, options ) {
				/// <summary>加载有href的元素</summary>
				/// <para>str options.href：不可缺省</para>
				/// <para>fun optiosn.complete:回调函数</para>
				/// <para>obj options.context:complete的作用域</para>
				/// <para>num options.timeout:超时时间。缺省为10000</para>
				/// <para>fun options.fail:错误函数</para>
				/// <param name="ele" type="Element">元素</param>
				/// <param name="options" type="Object">参数</param>
				/// <returns type="self" />
				var opt = utilExtend.extend( {}, src.hrefSetting, options );
				return src.src( ele, opt, "href" );
			},
			hrefSetting: {
				href: ""
			},

			link: function( options ) {
				/// <summary>加载link元素</summary>
				/// <para>str options.href：不可缺省</para>
				/// <para>link没有回调函数</para>
				/// <param name="options" type="Object">参数</param>
				/// <returns type="self" />
				var _link = document.createElement( "link" ),
					_head = document.getElementsByTagName( "HEAD" ).item( 0 ),
					opt = utilExtend.extend( {}, src.linkSetting, options );
				_link.rel = opt.rel;
				_link.type = opt.type;
				src.href( _link, opt );
				_head.appendChild( _link );
				return this;
			},
			linkSetting: {
				rel: "stylesheet",
				href: "",
				type: "text/css"
			},

			src: function( ele, options ) {
				/// <summary>加载有src的元素</summary>
				/// <para>str options.src：不可缺省</para>
				/// <para>fun optiosn.complete:回调函数</para>
				/// <para>obj options.context:complete的作用域</para>
				/// <para>num options.timeout:超时时间。缺省为10000</para>
				/// <para>fun options.fail:错误函数</para>
				/// <param name="ele" type="Element">元素</param>
				/// <param name="options" type="Object">参数</param>
				/// <returns type="self" />
				var property = arguments[ 2 ] || "src";
				if ( !typed.isElement( ele ) || ( !hasOwnProperty.call( ele, property ) && ele[ property ] === undefined ) ) {
					return this;
				}
				var onload = ele.onload,
					onerror = ele.onerror;
				ele.setAttribute( property, "" );
				var o = utilExtend.extend( {}, $.srcSetting, options ),
					timeId;

				ele.onload = function( e ) {
					clearTimeout( timeId );
					o.complete && o.complete.call( o.context || this, this );
					ele.onload = onload;
					ele.onerror = onerror;
					ele = timeId = o = null;
					onload && onload.call( this, e );
				};
				ele.onerror = function( e ) {
					clearTimeout( timeId );
					o.fail && o.fail.call( o.context || this, this );
					ele.onload = onload;
					ele.onerror = onerror;
					ele = o = timeId = null;
					onerror && onerror.call( this, e );
				};

				if ( o.timeout ) {
					timeId = setTimeout( function() {
						o.fail && o.fail.call( o.context || this, this );
						ele.onload = onload;
						ele.onerror = onerror;
						ele = o = timeId = null;
					}, o.timeout );
				}

				if ( typed.isNode( ele, "iframe" ) && !o.history && ele.contentWindow ) {
					ele.contentWindow.location.replace( o[ property ] );
				} else {
					ele.setAttribute( property, o[ property ] );
				}

				return this;

			},
			srcSetting: {
				fail: function( e ) {
					$.logger( "aQuery.src", ( this.src || "(empty)" ) + "of " + this.tagName + " getting error:" + e.toString() );
				},
				timeout: false,
				src: "",
				history: true
			}
		};

	$.fn.extend( {
		href: function( options ) {
			/// <summary>加载有href的元素</summary>
			/// <para>str options.href：不可缺省</para>
			/// <para>fun optiosn.complete:回调函数</para>
			/// <para>obj options.context:complete的作用域</para>
			/// <para>num options.timeout:超时时间。缺省为10000</para>
			/// <para>fun options.fail:错误函数</para>
			/// <returns type="self" />
			return this.each( function( ele ) {
				$.href( ele, options );
			} );
		},

		src: function( options ) {
			/// <summary>加载有src的元素</summary>
			/// <para>str options.src：不可缺省</para>
			/// <para>fun optiosn.complete:回调函数</para>
			/// <para>obj options.context:complete的作用域</para>
			/// <para>num options.timeout:超时时间。缺省为10000</para>
			/// <para>fun options.fail:错误函数</para>
			/// <returns type="self" />
			return this.each( function( ele ) {
				$.src( ele, options );
			} );
		}
	} );

	$.extend( src );

	return src;
} );