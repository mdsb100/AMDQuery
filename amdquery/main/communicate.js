aQuery.define( "main/communicate", [ "base/typed", "base/extend", "main/event", "main/parse" ], function( $, typed, utilExtend, parse, undefined ) {
	"use strict"; //启用严格模式
	var communicate = {
		ajax: function( options ) {
			/// <summary>AJAX数据请求
			/// <para>如果没有参数，则直接返回生成的AJAX的对象实例</para>
			/// <para>str options.type:"get"||"post" 缺省"get"</para>
			/// <para>str options.url：不可缺省</para>
			/// <para>str options.data:数据 缺省为""</para>
			/// <para>bol options.async:true||false 缺省为true表示异步</para>
			/// <para>fun options.complete:回调函数</para>
			/// <para>obj options.context:complete的作用域</para>
			/// <para>obj options.header:头信息</para>
			/// <para>obj options.isRandom:是否带随机数以获得最新数据</para>
			/// <para>num options.timeout:超时时间。缺省为10000</para>
			/// <para>str options.routing:路由 缺省为""</para>
			/// <para>fun options.timeoutFun:超时后的事件</para>
			/// <para>str options.dataType:"json"|"xml"|"text"|"html" 缺省"text"</para>
			/// <para>str options.contentType: 缺省"application/x-www-form-urlencoded"</para>
			/// </summary>
			/// <param name="options" type="Object">参数</param>
			/// <returns type="self" />
			var _ajax, _timeId, o;
			if ( options ) {
				_ajax = $.getXhrObject( options.newXhr );

				if ( _ajax ) {

					o = utilExtend.extend( {}, $.ajaxSetting, options );

					o.data = $.getURLParam( o.data );

					if ( o.isRandom == true && o.type == "get" ) {
						o.data += "&random=" + $.now();
					}
					o.url += o.routing;
					switch ( o.type ) {
						case "get":
							if ( o.data ) {
								o.url += "?" + o.data;
							}
							break;
						case "post":
							break;
					}

					if ( o.username ) {
						_ajax.open( o.type, o.url, o.async, o.username, o.password );
					} else {
						_ajax.open( o.type, o.url, o.async );
					}

					try {
						for ( var item in o.header ) {
							_ajax.setRequestHeader( item, o.header[ item ] );
						}
						_ajax.setRequestHeader( "Accept", o.dataType && o.accepts[ o.dataType ] ? o.accepts[ o.dataType ] + ", */*" : o.accepts._default );

					} catch ( e ) {}
					if ( o.data || options ) {
						_ajax.setRequestHeader( "Content-Type", o.contentType );
					}
					//_ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
					//type == "post" && _ajax.setRequestHeader("Content-type", "");
					_ajax.onreadystatechange = function() {
						if ( ( _ajax.readyState == 4 || _ajax.readyState == 0 ) && ( ( _ajax.status >= 200 && _ajax.status < 300 ) || _ajax.status == 304 ) ) {
							var response;
							clearTimeout( _timeId );
							$.trigger( "ajaxStop", _ajax, o );
							switch ( o.dataType ) {
								case "json":
									response = parse.JSON( "(" + _ajax.responseText + ")" );
									break;
								case "xml":
									response = _ajax.responseXML;
									if ( !response ) {
										try {
											response = parse.parseXML( _ajax.responseText );
										} catch ( e ) {}
									}
									break;
								default:
								case "text":
									response = _ajax.responseText;
									break;
							}
							try {
								o.complete && o.complete.call( o.context || _ajax, response );
							} finally {
								o = null;
								_ajax = null;
							}
						}
					};
					if ( o.timeout ) {
						_timeId = setTimeout( function() {
							_ajax && _ajax.abort();
							$.trigger( "ajaxTimeout", _ajax, o );
							o.timeoutFun.call( _ajax, o );
							o = null;
							_ajax = null;
						}, o.timeout );
					}
					$.trigger( "ajaxStart", _ajax, o );
					_ajax.send( o.type == "get" ? "NULL" : ( o.data || "NULL" ) );
				}
			}
			return this;
		},
		ajaxByFinal: function( list, complete, context ) {
			/// <summary>加载几段ajax，当他们都加载完毕触发个事件
			/// </summary>
			/// <param name="list" type="Array:[options]">包含获取js配置的数组，参考jsonp</param>
			/// <param name="complete" type="Function">complete</param>
			/// <param name="context" type="Object">作用域</param>
			/// <returns type="self" />
			var sum = list.length,
				count = 0;
			return $.each( list, function( item ) {
				item._complete = item.complete;
				item.complete = function() {
					count++;
					item._complete && item._complete.apply( this, arguments );
					if ( count == sum ) {
						complete && complete.apply( window, context );
						count = null;
						sum = null;
					}
				};
				$.ajax( item );
			} );
		},
		ajaxSetting: {
			url: location.href,
			dataType: "text",
			type: "GET",
			contentType: "application/x-www-form-urlencoded",
			context: null,
			async: true,
			timeout: false,
			timeoutFun: function( o ) {
				$.logger( "aQuery.ajax", o.url + "of ajax is timeout:" + ( o.timeout / 1000 ) + "second" );
			},
			routing: "",
			header: null,
			isRandom: false,
			accepts: {
				xml: "application/xml, text/xml",
				html: "text/html",
				//script: "text/javascript, application/javascript",
				json: "application/json, text/javascript",
				text: "text/plain",
				_default: "*/*"
			}
		},

		jsonp: function( options ) {
			/// <summary>加载一段script
			/// <para>str options.url：不可缺省</para>
			/// <para>str options.chaset:缺省为"GBK"</para>
			/// <para>fun options.complete:回调函数</para>
			/// <para>bol options.isDelete:是否删除这段script 缺省为true</para>
			/// <para>obj options.context:complete的作用域</para>
			/// <para>str/obj options.checkString:检查变量结果</para>
			/// <para>obj options.isRandom:是否带随机数以获得最新数据</para>
			/// <para>str options.routing:路由 缺省为""</para>
			/// <para>str/bol options.JSONP:true为aQuery形式、str为自定义JSONP</para>
			/// <para>str options.JSONPKey:有些时候后台不一定支持字段名为JSONP，可能叫Callback等，这提供了灵活定义</para>
			/// </summary>
			/// <param name="options" type="Object/String">参数或脚本内容</param>
			/// <returns type="self" />

			var _scripts = document.createElement( "script" ),
				_head = document.getElementsByTagName( "HEAD" ).item( 0 ),
				o = utilExtend.extend( {}, $.jsonpSetting, options ),
				_data = "",
				_timeId, random = "";
			//            , _checkString = o.checkString
			//            , isDelete = options.isDelete || false;

			_data = $.getURLParam( o.data );


			if ( o.JSONP ) {
				random = ( "aQuery" + $.now() ) + parseInt( Math.random() * 10 );
				window[ random ] = function() {
					typed.isFun( o.complete ) && o.complete.apply( o.context || window, arguments );
				};
				//o.JSONP = random;
				_data += "&" + ( o.JSONP ) + "=" + random;
				//_data += "&complete=" + random;
			}
			//            if (typed.isStr(o.JSONP)) {
			//                _data += "&" + (o.JSONPKey) + "=" + o.JSONP;
			//            }

			o.isRandom == true && ( _data += "&random=" + $.now() );

			o.url += o.routing + ( _data == "" ? _data : "?" + _data );

			//IE和其他浏览器 不一样

			_scripts.onload = _scripts.onreadystatechange = function() {
				if ( !this.readyState || this.readyState == "loaded" || this.readyState == "complete" ) {
					clearTimeout( _timeId );
					$.trigger( "getJSStop", _scripts, o );
					var js = typeof window[ o.checkString ] != "undefined" ? window[ o.checkString ] : undefined;
					!o.JSONP && typed.isFun( o.complete ) && o.complete.call( o.context || this, js );
					//typed.isFun(o.complete) && o.complete.call(o.context || this, js);
					this.nodeName.toLowerCase() == "script" && o.isDelete == true && _head.removeChild( this );
					this.onerror = this.onload = o = _head = null;
					if ( window[ random ] ) {
						window[ random ] = undefined;
						random = null;
					}
				}
			};

			_scripts.onerror = o.error;

			o.timeout && ( _timeId = setTimeout( function() {
				$.trigger( "getJSTimeout", _scripts, o );
				o.timeoutFun.call( this, o );
				_scripts = _scripts.onerror = _scripts.onload = o.error = _head = null;
				if ( window[ random ] ) {
					window[ random ] = undefined;
					random = null;
				}
			}, o.timeout ) );

			_scripts.setAttribute( "src", o.url );
			o.charset && _scripts.setAttribute( "charset", o.charset );
			_scripts.setAttribute( "type", "text/javascript" );
			_scripts.setAttribute( "language", "javascript" );

			$.trigger( "getJSStart", _scripts, o );
			_head.insertBefore( _scripts, _head.firstChild );
			return this;
		},
		jsonpSetting: {
			chaset: "",
			checkString: "",
			error: function() {
				$.logger( "aQuery.jsonp", ( this.src || "(empty)" ) + " of javascript getting error" );
			},
			isDelete: true,
			isRandom: false,
			JSONP: false,
			JSONPKey: "JSONP",
			routing: "",
			timeout: false,
			timeoutFun: function( o ) {
				$.logger( aQuery.jsonp, ( o.url || "(empty)" ) + "of ajax is timeout:" + ( o.timeout / 1000 ) + "second" );
			},
			url: ""
		},
		jsonpsByFinal: function( list, complete, context ) {
			/// <summary>加载几段script，当他们都加载完毕触发个事件
			/// </summary>
			/// <param name="list" type="Array:[options]">包含获取js配置的数组，参考jsonp</param>
			/// <param name="complete" type="Function">complete</param>
			/// <param name="context" type="Object">作用域</param>
			/// <returns type="self" />
			var sum = list.length,
				count = 0;
			$.each( list, function( item ) {
				item._complete = item.complete;
				item.complete = function() {
					count++;
					item._complete && item._complete.apply( this, arguments );
					if ( count == sum ) {
						complete && complete.apply( window, context );
						count = null;
						sum = null;
					}
				};
				$.jsonp( item );
			} );
			return this;
		},
		getURLParam: function( content ) {
			/// <summary>返回url参数</summary>
			/// <param name="content" type="String/Object/$/Array[element]">内容可以是Object键值对，也可以是数组形式的element，也可以是aQuery对象</param>
			/// <returns type="String" />
			var list = [];
			if ( typed.isObj( content ) ) {
				$.each( content, function( value, name ) {
					value = typed.isFun( value ) ? value() : value;
					!typed.isNul( value ) && list.push( encodeURIComponent( name ) + "=" + encodeURIComponent( value ) );
				} );
				content = list.join( "&" );
			} else if ( typed.is$( content ) || ( typed.isArr( content ) && typed.isEle( content[ 0 ] ) ) ) {
				$.each( content, function( item ) {
					!typed.isNul( item.value ) && list.push( encodeURIComponent( item.name ) + "=" + encodeURIComponent( item.value ) );
				} );
				content = list.join( "&" );
			} else if ( !typed.isStr( content ) ) {
				content = "";
			}
			return content; //encodeURIComponent(content); //转第二次码
		},
		getXhrObject: function( xhr ) {
			/// <summary>生成一个XMLHttpRequest</summary>
			/// <param name="isNewXhr" type="Boolean">是否从xhr池里获得</param>
			/// <returns type="XMLHttpRequest" />
			if ( !xhr ) {
				if ( window.ActiveXObject ) {
					$.each( [ "Microsoft.XMLHttp", "MSXML2.XMLHttp", "MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.5.0", "MSXML2.XMLHttp.4.0", "MSXML2.XMLHttp.3.0" ], function( value ) {
						try {
							xhr = new ActiveXObject( value );
							return xhr;
						} catch ( e ) {

						}
					}, this );
				} else {
					try {
						xhr = new XMLHttpRequest();
					} catch ( e ) {}
				}
				if ( !xhr ) {
					$.logger( "getXhrObject", "broswer no support AJAX" );
				}
			}
			return xhr;
		}
	};

	$.extend( communicate );

	return communicate;
} );