aQuery.define( "main/event", [ "base/config", "base/typed", "base/extend", "base/client", "base/array", "main/CustomEvent", "main/data" ], function( $, config, typed, utilExtend, client, array, CustomEvent, data, undefined ) {
	"use strict";
	var mouse = "contextmenu click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave mousewheel DOMMouseScroll".split( " " ),
		/*DOMMouseScroll firefox*/
		mutation = "load unload error".split( " " ),
		html = "blur focus focusin focusout".split( " " ),
		key = "keydown keypress keyup".split( " " ),
		other = "resize scroll change select submit DomNodeInserted DomNodeRemoved".split( " " ),
		_eventNameList = [].concat( mouse, mutation, html, key, other ),
		_domEventList = {},
		eventHooks = {
			type: function( type ) {
				/// <summary>兼容事件类型名</summary>
				/// <param name="type" type="String"></param>
				/// <returns type="String" />
				var temp;
				switch ( type ) {
					case "focus":
						if ( client.browser.ie ) type += "in";
						break;
					case "blur":
						if ( client.browser.ie ) type = "focusout";
						break;
					case "touchwheel":
						type = "mousewheel";
						if ( client.browser.firefox ) type = "DOMMouseScroll";
						break;
					case "mousewheel":
						if ( client.browser.firefox ) type = "DOMMouseScroll";
						break;
				}
				if ( ( temp = $.interfaces.trigger( "eventHooks", type ) ) ) type = temp;
				return type;
			},
			compatibleEvent: function( e ) {
				var eventDoc = $.event.document;
				e.getCharCode = function() {
					eventDoc.getCharCode( this );
				};
				e.preventDefault || ( e.preventDefault = function() {
					this.returnValue = false;
				} );
				e.stopPropagation || ( e.stopPropagation = function() {
					this.cancelBubble = true;
				} );
				e.getButton = function() {
					eventDoc.getButton( this );
				};
			},
			proxy: function( fun ) {
				/// <summary>代理，主要是用于addHandler</summary>
				/// <param name="fun" type="Function">方法</param>
				/// <returns type="Function" />
				if ( !fun.__guid ) {
					var temp;
					fun.__guid = function( e ) {
						var evt = $.event.document.getEvent( e ),
							target = this;

						if ( typed.isEvent( evt ) ) {
							target = $.event.document.getTarget( e );
							if ( ( temp = $.interfaces.trigger( "proxy", evt, target ) ) ) {
								evt = temp.event;
								target = temp.target;
							}
							config.module.compatibleEvent && eventHooks.compatibleEvent( evt );
						}

						fun.call( target, evt || {} );
					};
				}
				return fun.__guid;
			}
		},
		event = {
			addHandler: function( ele, type, fun ) {
				/// <summary>给aQuery或元素添加事件</summary>
				/// <para>$.addHandler(ele,"click",function(){})</para>
				/// <para>$.addHandler("ajaxStart",function(){})</para>
				/// <param name="ele" type="Element/String">元素或类型</param>
				/// <param name="type" type="String/Function">方法或类型</param>
				/// <param name="fun" type="Function/undefined">方法或空</param>
				/// <returns type="self" />
				if ( fun === null || type === null ) {
					return this.clearHandlers( ele, type );
				}

				if ( typed.isEle( ele ) || typed.isWindow( ele ) ) {
					var data, proxy, item, types = type.split( " " ),
						i = types.length - 1;

					if ( !( data = $.data( ele, "_handlers_" ) ) ) {
						data = $.data( ele, "_handlers_", new CustomEvent() );
					}
					proxy = eventHooks.proxy( fun, this );

					for ( ; i >= 0; i-- ) {
						item = types[ i ];
						if ( data.hasHandler( item, fun ) == -1 && _domEventList[ item ] ) {
							item = eventHooks.type( item );
							$.event.document._addHandler( ele, item, proxy );
						}
					}

					type && fun && data.addHandler( type, fun );
				} else {
					$.bus.addHandler( ele, type );
				}
				return this;
			},
			once: function( ele, type, fun ) {
				if ( typed.isEle( ele ) || typed.isWindow( ele ) ) {
					var data, proxy, item, types = type.split( " " ),
						i = types.length - 1;

					if ( !( data = $.data( ele, "_handlers_" ) ) ) {
						data = $.data( ele, "_handlers_", new CustomEvent() );
					}
					proxy = eventHooks.proxy( fun, this );

					for ( ; i >= 0; i-- ) {
						item = types[ i ];
						if ( data.hasHandler( item, fun ) == -1 && _domEventList[ item ] ) {
							item = eventHooks.type( item );
							$.event.document.once( ele, item, proxy );
						}
					}

					type && fun && data.once( type, proxy );
				} else {
					$.bus.once( ele, type );
				}
			},

			ajaxStart: function( fun ) {
				/// <summary>ajax开始</summary>
				/// <param name="fun" type="Function">方法</param>
				/// <returns type="self" />
				$.bus.addHandler( arguments[ 1 ] || "ajaxStart", fun );
				return this;
			},
			ajaxStop: function( fun ) {
				/// <summary>ajax停止</summary>
				/// <param name="fun" type="Function">方法</param>
				/// <returns type="self" />
				return $.ajaxStart( fun, "ajaxStop" );
			},
			ajaxTimeout: function( fun ) {
				/// <summary>ajax超时</summary>
				/// <param name="fun" type="Function">方法</param>
				/// <returns type="self" />
				return $.ajaxStart( fun, "ajaxTimeout" );
			},

			bus: ( new CustomEvent() ),

			clearHandlers: function( ele, type ) {
				/// <summary>移除dom元素的所有事件或所有aQuery提供的事件，如果类型存在则删除这种类型</summary>
				/// <param name="ele" type="Element/undefined">元素</param>
				/// <param name="type" type="String/undefinded">事件类型</param>
				/// <returns type="self" />
				if ( typed.isEle( ele ) || typed.isWindow( ele ) ) {
					var data = $.data( ele, "_handlers_" );
					if ( !data ) {
						return this;
					}
					var handlerMap = data._handlerMap,
						map = {},
						j = 0,
						len = 0,
						i, item, fun;

					if ( type ) {
						var types = type.split( " " ),
							z = types.length - 1;
						for ( ; z >= 0; z-- ) {
							item = types[ z ];
							if ( item in handlerMap ) {
								map[ item ] = 1;
							}
						}
					}

					for ( i in map ) {
						item = data._nameSpace( i );
						for ( j = 0, len = item.length; j < len; j++ ) {
							fun = item[ j ];
							_domEventList[ i ] && $.event.document._removeHandler( ele, i, fun.__guid || fun );
						}
					}
					data.clearHandlers( type );
				} else {
					$.bus.clearHandlers( ele );
				}
				return this;
			},

			cloneHandlers: function( ele, handlerEve ) {
				var customEvent = data.data( handlerEve, "_handlers_" );
				if ( customEvent ) {
					var handlerMap = customEvent._handlerMap,
						j = 0,
						len = 0,
						i, item, fun;

					for ( i in handlerMap ) {
						item = customEvent._nameSpace( i );
						for ( j = 0, len = item.length; j < len; j++ ) {
							fun = item[ j ];
							_domEventList[ i ] && $.event.document._addHandler( ele, i, fun.__guid || fun );
						}
					}
					data.data( ele, "_handlers_", customEvent );
				}
			},

			getJSStart: function( fun ) {
				/// <summary>加载js开始</summary>
				/// <param name="fun" type="Function">方法</param>
				/// <returns type="self" />
				return $.ajaxStart( fun, "getJSStart" );
			},
			getJSStop: function( fun ) {
				/// <summary>加载js停止</summary>
				/// <param name="fun" type="Function">方法</param>
				/// <returns type="self" />
				return $.ajaxStart( fun, "getJSStop" );
			},
			getJSTimeout: function( fun ) {
				/// <summary>加载js超时</summary>
				/// <param name="fun" type="Function">方法</param>
				/// <returns type="self" />
				return $.ajaxStart( fun, "getJSTimeout" );
			},

			hasHandler: function( ele, type, fun ) {
				/// <summary>查找aQuery或元素事件</summary>
				/// <param name="ele" type="Element/String">元素或类型</param>
				/// <param name="type" type="String/Function">方法或类型</param>
				/// <param name="fun" type="Function/undefined">方法</param>
				/// <returns type="Number" />
				if ( typed.isEle( ele ) || typed.isWindow( ele ) ) {
					var proxy;
					if ( _domEventList[ type ] ) {
						proxy = fun.__guid || fun;
						type = eventHooks.type( type );
						return $.event.document.hasHandler( ele, type, proxy );
					}

					return -1;
				} else {
					return $.bus.hasHandler( ele, type );
				}
			},

			event: {
				custom: CustomEvent,

				document: {
					addHandler: function( ele, type, fn ) {
						/// <summary>给DOM元素添加事件</summary>
						/// <para>例:"mousedown mouseup"</para>
						/// <param name="ele" type="Element">元素</param>
						/// <param name="type" type="String">事件类型</param>
						/// <param name="fn" type="Function">事件方法</param>
						/// <returns type="null" />
						var types = type.split( " " ),
							i = types.length - 1;
						for ( ; i >= 0; i-- ) {
							this._addHandler( ele, types[ i ], fn );
						}

					},
					_addHandler: function( ele, type, fn ) {
						if ( ele.addEventListener ) ele.addEventListener( type, fn, false ); //事件冒泡
						else if ( ele.attachEvent ) ele.attachEvent( "on" + type, fn );
						else {
							ele[ "on" + type ] = fn;
							ele = null;
						}
					},
					once: function( ele, type, fn ) {
						var self = this,
							fnproxy = function() {
								self._removeHandler( ele, type, fnproxy );
								fn.apply( this, arguments );
							};
						return this._addHandler( type, fnproxy );
					},
					removeHandler: function( ele, type, fn ) {
						/// <summary>给DOM元素移除事件</summary>
						/// <param name="ele" type="Element">元素</param>
						/// <param name="type" type="String">事件类型</param>
						/// <param name="fn" type="Function">事件方法</param>
						/// <returns type="null" />
						var types = type.split( " " ),
							i = types.length - 1;
						for ( ; i >= 0; i-- ) {
							this._removeHandler( ele, types[ i ], fn );
						}
					},
					_removeHandler: function( ele, type, fn ) {
						if ( ele.removeEventListener ) ele.removeEventListener( type, fn, false );
						else if ( ele.detachEvent ) ele.detachEvent( "on" + type, fn );
						else ele[ "on" + type ] = null;
					},
					// , clearHandlers: function (ele) {
					//     /// <summary>移除dom元素的所有事件</summary>
					//     /// <param name="ele" type="Element">元素</param>
					// }

					createEvent: function( type ) {
						/// <summary>创建原生事件对象</summary>
						/// <param name="type" type="String">事件类型</param>
						/// <returns type="Event" />
						var e;
						if ( document.createEvent ) {
							e = document.createEvent( type );
						} else if ( document.createEventObject ) {
							e = document.createEventObject();
						}
						return e;
					},
					dispatchEvent: function( ele, event, type ) {
						/// <summary>触发事件</summary>
						/// <param name="ele" type="Element">元素</param>
						/// <param name="event" type="Event">事件对象</param>
						/// <param name="type" type="String">事件类型</param>
						/// <returns type="null" />
						if ( ele.dispatchEvent ) {
							ele.dispatchEvent( event );
						} else if ( ele.fireEvent ) {
							ele.fireEvent( "on" + type, event, false );
						}
					},
					getCharCode: function( e ) {
						/// <summary>获得兼容的charCode对象</summary>
						/// <param name="e" type="Event">event对象</param>
						/// <returns type="Number" />
						return ( e.keyCode ? e.keyCode : ( e.which || e.charCode ) ) || 0;
					},
					getEvent: function( e ) {
						/// <summary>获得兼容的事件event对象</summary>
						/// <param name="e" type="Event">event对象</param>
						/// <returns type="event" />
						return e || window.event;
					},
					getTarget: function( e ) {
						/// <summary>获得事件对象</summary>
						/// <param name="e" type="Event">event对象</param>
						/// <returns type="Element" />
						return e.srcElement || e.target;
					},
					imitation: {
						_keySettings: {
							bubbles: true,
							cancelable: true,
							view: document.defaultView,
							detail: 0,
							ctrlKey: false,
							altKey: false,
							shiftKey: false,
							metaKey: false,
							keyCode: 0,
							charCode: 0
						},
						_editKeyCharCode: function( setting ) {
							var code = event.event.document.getCharCode( setting );
							delete setting.charCode;
							delete setting.keyCode;
							delete setting.which;

							if ( client.engine.webkit ) {
								setting.charCode = code;
							} else if ( client.engine.ie ) {
								setting.charCode = code;
							} else {
								setting.keyCode = setting.which = code;
							}
						},
						key: function( ele, type, paras ) {
							/// <summary>触发DOM元素key事件</summary>
							/// <param name="ele" type="Element">dom元素</param>
							/// <param name="type" type="String">事件类型</param>
							/// <param name="paras" type="Object">模拟事件参数</param>
							/// <returns type="null" />
							var eventF = event.event.document,
								createEvent = eventF.createEvent,
								settings = i = utilExtend.extend( {}, eventF.imitation._keySettings, paras ),
								e, i, name;
							eventF.imitation._editKeyCharCode( settings );
							if ( client.browser.firefox ) {
								e = createEvent( "KeyEvents" );
								e.initKeyEvent( type, i.bubbles, i.cancelable, i.view, i.ctrlKey, i.altKey, i.shiftKey, i.metaKey, i.keyCode, i.charCode );
							} else if ( client.browser.ie678 ) {
								e = createEvent();
								for ( i in settings ) {
									e[ i ] = settings[ i ];
								}
							} else {
								name = "Events";
								client.browser.safari && client.browser.safari < 3 && ( name = "UIEvents" );
								e = createEvent( name );
								e.initEvent( type, settings.bubbles, settings.cancelable );
								delete settings.bubbles;
								delete settings.cancelable;

								for ( i in settings ) {
									e[ i ] = settings[ i ];
								}
							}
							eventF.dispatchEvent( ele, e, type );

						},
						_mouseSettings: {
							bubbles: true,
							cancelable: true,
							view: document.defaultView,
							detail: 0,
							screenX: 0,
							screenY: 0,
							clientX: 0,
							clientY: 0,
							ctrlKey: false,
							altKey: false,
							metaKey: false,
							shiftKey: false,
							button: 0,
							relatedTarget: null
						},
						mouse: function( ele, type, paras ) {
							/// <summary>触发DOM元素Mouse事件</summary>
							/// <param name="ele" type="Element">dom元素</param>
							/// <param name="type" type="String">事件类型</param>
							/// <param name="paras" type="Object">模拟事件参数</param>
							/// <returns type="null" />
							var eventF = event.event.document,
								createEvent = eventF.createEvent,
								settings = utilExtend.extend( {}, eventF.imitation._mouseSettings, paras ),
								e, i = settings;
							if ( client.browser.safari && client.browser.safari < 3 ) {
								e = createEvent( "UIEvents" );
								e.initEvent( type, settings.bubbles, settings.cancelable );
								delete settings.bubbles;
								delete settings.cancelable;
								for ( i in settings ) {
									e[ i ] = settings[ i ];
								}
							} else if ( client.browser.ie678 ) {
								e = createEvent();
								for ( i in settings ) {
									e[ i ] = settings[ i ];
								}
							} else {
								e = createEvent( "MouseEvents" );
								e.initMouseEvent( type, i.bubbles, i.cancelable, i.view, i.detail, i.screenX, i.screenY, i.clientX, i.clientY, i.ctrlKey, i.altKey, i.metaKey, i.shiftKey, i.button, i.relatedTarget );
							}
							eventF.dispatchEvent( ele, e, type );

						},
						_htmlSettings: {
							bubbles: true,
							cancelable: true
						},
						html: function( ele, type, paras ) {
							/// <summary>触发DOM元素html事件:blur focus focusin focusout</summary>
							/// <param name="ele" type="Element">dom元素</param>
							/// <param name="type" type="String">事件类型</param>
							/// <param name="paras" type="Object">模拟事件参数</param>
							/// <returns type="null" />
							var eventF = event.event.document,
								createEvent = eventF.createEvent,
								settings = utilExtend.extend( {}, eventF.imitation._htmlSettings, paras ),
								e, i = settings;

							if ( client.browser.ie678 ) {
								e = createEvent();
								for ( i in settings ) {
									e[ i ] = settings[ i ];
								}
							} else {
								e = createEvent( "HTMLEvents" );
								e.initEvent( type, settings.bubbles, settings.cancelable );
								delete settings.bubbles;
								delete settings.cancelable;
								for ( i in settings ) {
									e[ i ] = settings[ i ];
								}
							}

							eventF.dispatchEvent( ele, e, type );

						}
					},
					preventDefault: function( e ) {
						/// <summary>阻止Element对象默认行为</summary>
						/// <param name="e" type="Event">event对象</param>
						/// <returns type="null" />
						if ( e.preventDefault ) e.preventDefault();
						else e.returnValue = false;
					},
					stopPropagation: function( e ) {
						/// <summary>阻止Element对象事件的冒泡</summary>
						/// <param name="e" type="Event">event对象</param>
						/// <returns type="null" />
						if ( e.stopPropagation ) e.stopPropagation();
						else e.cancelBubble = true;
					},
					getButton: function( e ) {
						/// <summary>获得鼠标的正确点击类型</summary>
						/// <param name="e" type="Event">event对象</param>
						/// <returns type="Number" />
						if ( document.implementation.hasFeature( "MouseEvents", "2.0" ) ) return e.button;
						else {
							switch ( e.button ) {
								case 0:
								case 1:
								case 3:
								case 5:
								case 7:
									return 0;
								case 2:
								case 6:
									return 2;
								case 4:
									return 1;
							}
						}
					},
					on: function( ele, type, fn ) {
						return this.addHandler( ele, type, fn );
					},
					off: function( ele, type, fn ) {
						return this.removeHandler( ele, type, fn );
					}
				},
				domEventList: _domEventList

				//aQuery的事件
			},
			error: function( isMsgDiv ) {
				/// <summary>抛出异常</summary>
				/// <param name="isMsgDiv" type="Boolean">是否以div内容出现否则为title</param>
				/// <returns type="self" />
				$.event.document.addHandler( window, "error", function( e, url, line ) {
					var msg = e.message || "no message",
						filename = e.filename || e.sourceURL || e.stacktrace || url;
					line = e.lineno || e.lineNumber || e.number || e.lineNumber || e.line || line;
				} );
				return this;
			},

			_initHandler: function( ele ) {
				/// <summary>初始化事件集</summary>
				/// <param name="ele" type="Element/undefined">元素</param>
				/// <private/>
				$.data( ele, "_handlers_" ) || $.data( ele, "_handlers_", new CustomEvent() );
				return this;
			},

			removeHandler: function( ele, type, fun ) {
				/// <summary>给aQuery或元素添加事件</summary>
				/// <para>$.removeHandler(ele,"click",fun)</para>
				/// <para>$.removeHandler("ajaxStart",fun)</para>
				/// <param name="ele" type="Element/String">元素或类型</param>
				/// <param name="type" type="String/Function">方法或类型</param>
				/// <param name="fun" type="Function/undefined">方法或空</param>
				/// <returns type="self" />
				if ( typed.isEle( ele ) || typed.isWindow( ele ) ) {
					var data, proxy = fun.__guid || fun,
						types = type.split( " " ),
						i = types.length - 1,
						item;

					for ( ; i >= 0; i-- ) {
						item = types[ i ];
						if ( _domEventList[ item ] ) {
							item = eventHooks.type( item );
							$.event.document._removeHandler( ele, item, proxy );
						}
					}

					if ( !( data = $.data( ele, "_handlers_" ) ) ) {
						data = $.data( ele, "_handlers_", new CustomEvent() );
					}

					type && fun && data.removeHandler( type, fun );

				} else {
					$.bus.removeHandler( ele, type );
				}
				return this;
			},

			searchCustomEvent: function( type ) {
				/// <summary>搜索注册的自定义事件</summary>
				/// <param name="type" type="String">事件名</param>
				/// <returns type="String" />
				var key = $.event.customEventName[ type ];
				//要改。为了addevent。
				//            $.each(, function (value, name) {
				//                if (type === name) {
				//                    key = value
				//                    return false;
				//                }
				//            }, this);
				return key || "";
			},

			toggle: function( ele, funParas ) {
				/// <summary>切换点击或解除绑定</summary>
				/// <para>若只有ele 就解除绑定</para>
				/// <param name="ele" type="Element">element元素</param>
				/// <param name="funParas" type="Function:[]/undefined">方法组</param>
				/// <returns type="self" />
				var arg = $.util.argToArray( arguments, 1 ),
					index = 0,
					data;
				if ( arg.length > 1 ) {
					if ( data = $.data( ele, "_toggle_" ) ) {
						arg = data.arg.concat( arg );
						index = data.index;
					}

					$.data( ele, "_toggle_", {
						index: index,
						arg: arg
					} );

					$.addHandler( ele, "click", this._toggle );
				} else {
					$.removeHandler( ele, "click", this._toggle );
					$.removeData( ele, "_toggle_" );
				}
				//移除事件 添加至event 移除 arg len
				return this;
			},
			_toggle: function( e ) {
				var self = $.event.document.getTarget( e ),
					data = $.data( self, "_toggle_" ),
					arg = data.arg,
					len = arg.length,
					index = data.index % len;

				arg[ index ].call( self, e );
				$.data( self, "_toggle_", {
					index: index + 1,
					arg: arg
				} );
			},

			// toggleClass: function(ele, classParas) {
			//     /// <summary>切换样式</summary>
			//     /// <param name="ele" type="Element">element元素</param>
			//     /// <param name="classParas" type="String:[]">样式名</param>
			//     /// <returns type="self" />
			//     var arg = $.util.argToArray(arguments, 1),
			//         index = 0,
			//         data;
			//     if(arg.length) {
			//         if(data = $.data(ele, "_toggleClass_")) {
			//             arg = data.arg.concat(arg);
			//             index = data.index;
			//         }

			//         $.data(ele, "_toggleClass_", {
			//             index: index,
			//             arg: arg
			//         });

			//         $.addHandler(ele, "click", function(e) {
			//             var self = $.event.document.getTarget(e),
			//                 data = $.data(self, "_toggleClass_"),
			//                 index = data.index,
			//                 arg = data.arg,
			//                 len = arg.length;

			//             $.addClass(self, arg[index % len]);
			//             $.removeClass(self, arg[index % len - 1] || arg[index % len + 1]);
			//             $.data(self, "_toggleClass_", {
			//                 index: index + 1,
			//                 arg: arg
			//             });
			//         });
			//     }
			//     //移除事件 添加至event 移除arg len
			//     return this;
			// },
			trigger: function( ele, type, context, paras ) {
				/// <summary>
				/// 触发自定义或者原生事件
				/// </summary>
				/// <param name="ele" type="Element">dom对象</param>
				/// <param name="type" type="String">事件类型</param>
				/// <param name="context" type="Object">当为自定义事件时 为作用域 否则为事件参数</param>
				/// <param name="paras" type="para:[any]">当为自定义事件时 为参数列表</param>
				/// <returns type="self"></returns>
				if ( typed.isEle( ele ) || typed.isWindow( ele ) ) {
					var data;
					if ( data = _domEventList[ type ] ) {
						type = eventHooks.type( type );
						typed.isFun( data ) ? data( ele, type, context ) : $.logger( "trigger", "triggering" + type + " is not supported" );
					} else {
						( data = $.data( ele, "_handlers_" ) ) && data.trigger.apply( data, [ type, context ].concat( $.util.argToArray( arguments, 3 ) ) );
					}
				} else {
					$.bus.trigger.apply( $.bus, arguments );
				}
				return this;
			}
		},
		i = 0,
		len;

	event.on = event.addHandler;
	event.off = event.removeHandler;
	event.clear = event.clearHandlers;

	$.extend( event );

	$.fn.extend( {
		addHandler: function( type, fun ) {
			/// <summary>给当前$所有DOM元素添加事件</summary>
			/// <param name="type" type="String">事件类型</param>
			/// <param name="fun" type="Function">事件方法</param>
			/// <returns type="self" />
			if ( !typed.isStr( type ) || !( typed.isFun( fun ) || fun === null ) ) return this;
			return this.each( function( ele ) {
				//                    fun = eventHooks.proxy(fun, this);
				//                    var key, result
				//                if ((key = $.searchCustomEvent(type))) {//直接绑定在 container ele上的事件
				//                    key = $.data(ele, key);
				//                    key && key.addHandler(type, fun);
				//                    return;
				//                }
				//type = eventHooks.type(type);
				$.addHandler( ele, type, fun );
			} );
		},
		once: function( type, fun ) {
			if ( !typed.isStr( type ) || !( typed.isFun( fun ) || fun === null ) ) return this;
			return this.each( function( ele ) {
				$.once( ele, type, fun );
			} );
		},

		clearHandlers: function( type ) {
			/// <summary>移除dom元素的所有事件或单独某一类事件</summary>
			/// <param name="type" type="String/undefinded">事件类型</param>
			/// <returns type="self" />
			return this.each( function( ele ) {
				$.clearHandlers( ele, type );
			} );
		},

		delegate: function( selector, type, fun ) {
			/// <summary>作为委托监听子元素</summary>
			/// <param name="selector" type="String">查询语句</param>
			/// <param name="type" type="String">事件类型</param>
			/// <param name="fun" type="Function">事件方法</param>
			/// <returns type="self" />
			return this.each( function( parentNode ) {
				$.addHandler( parentNode, type, function( e ) {
					var
					eleCollection = $.find( selector, parentNode ),
						target = event.event.document.getTarget( e ),
						ret = array.inArray( eleCollection || [], target );

					if ( ret > -1 ) {
						fun.call( target, e );
					}

				} );
			} );
		},

		removeHandler: function( type, fun ) {
			/// <summary>给所有DOM元素移除事件</summary>
			/// <para>例:"mousedown mouseup"</para>
			/// <param name="type" type="String">事件类型</param>
			/// <param name="fun" type="Function">事件方法</param>
			/// <returns type="self" />
			if ( !typed.isStr( type ) || !typed.isFun( fun ) ) return this;
			return this.each( function( ele ) {
				//fun = fun.__guid || fun;
				//                var key, result
				//                if ((key = $.searchCustomEvent(type))) {
				//                    key = $.data(ele, key);
				//                    key && key.removeHandler(type, fun);
				//                    return;
				//                }
				//type = eventHooks.type(type);
				$.removeHandler( ele, type, fun );
			} );
		},

		_initHandler: function() {
			/// <summary>初始化事件集</summary>
			/// <private/>
			return this.each( function( ele ) {
				$._initHandler( ele );
			} );
		},

		toggle: function( funParas ) {
			/// <summary>切换点击或解除绑定</summary>
			/// <para>若没有funParas 就解除绑定</para>
			/// <param name="funParas" type="Function:[]/Array[Function]">方法组</param>
			/// <returns type="self" />
			var arg = typed.isArr( funParas ) ? funParas : $.util.argToArray( arguments, 0 ),
				temp, i = 0,
				ele;
			for ( ; ele = this.eles[ i++ ]; ) {
				temp = arg.concat();
				temp.splice( 0, 0, ele );
				$.toggle.apply( $, temp );
			}
			return this;
		},
		// toggleClass: function(ele, classParas) {
		//     /// <summary>切换样式</summary>
		//     /// <param name="ele" type="Element">element元素</param>
		//     /// <param name="classParas" type="String:[]">样式名</param>
		//     /// <returns type="self" />
		//     var arg = typed.isArr(classParas) ? classParas : $.util.argToArray(arguments, 0),
		//         temp;
		//     for(; ele = this.eles[i++];) {
		//         temp = arg.concat();
		//         temp.splice(0, 0, ele);
		//         $.toggleClass.apply($, temp);
		//     }
		//     return this;
		//     //            return this.each(function (ele) {
		//     //                temp = arg.concat();
		//     //                temp.splice(0, 0, ele)
		//     //                $.toggleClass.apply($, temp);
		//     //            });
		//     //移除事件 添加至event 移除arg len
		// },
		trigger: function( type, a, b, c ) {
			/// <summary>
			/// 触发自定义或者原生事件
			/// </summary>
			/// <param name="ele" type="Element">dom对象</param>
			/// <param name="a" type="String">事件类型</param>
			/// <param name="b" type="Object">当为自定义事件时 为作用域 否则为事件参数</param>
			/// <param name="c" type="para:[any]">当为自定义事件时 为参数列表</param>
			/// <returns type="self"></returns>
			var arg = $.util.argToArray( arguments );
			return this.each( function( ele ) {
				$.trigger.apply( null, [ ele ].concat( arg ) );
			} );
		},

		blur: function( fun ) {
			/// <summary>绑定或触发mousedown事件</summary>
			/// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
			/// <returns type="self" />
			var type = arguments[ 1 ] || "blur";
			return typed.isFun( fun ) ? this.addHandler( type, fun ) : this.trigger( type, fun );
		},

		focus: function( fun ) {
			/// <summary>绑定或触发focus事件</summary>
			/// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
			/// <returns type="self" />
			return this.blur( fun, "focus" );
		},

		focusin: function( fun ) {
			/// <summary>绑定或触发focusin事件</summary>
			/// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
			/// <returns type="self" />
			return this.blur( fun, "focusin" );
		},

		focusout: function( fun ) {
			/// <summary>绑定或触发focusout事件</summary>
			/// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
			/// <returns type="self" />
			return this.blur( fun, "focusout" );
		},

		load: function( fun ) {
			/// <summary>绑定或触发load事件</summary>
			/// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
			/// <returns type="self" />
			return this.blur( fun, "load" );
		},

		resize: function( fun ) {
			/// <summary>绑定或触发resize事件</summary>
			/// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
			/// <returns type="self" />
			return this.blur( fun, "resize" );
		},

		scroll: function( fun ) {
			/// <summary>绑定或触发scroll事件</summary>
			/// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
			/// <returns type="self" />
			return this.blur( fun, "scroll" );
		},

		unload: function( fun ) {
			/// <summary>绑定或触发unload事件</summary>
			/// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
			/// <returns type="self" />
			return this.blur( fun, "unload" );
		},

		click: function( fun ) {
			/// <summary>绑定或触发click事件</summary>
			/// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
			/// <returns type="self" />
			return this.blur( fun, "click" );
		},

		dblclick: function( fun ) {
			/// <summary>绑定或触发dblclick事件</summary>
			/// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
			/// <returns type="self" />
			return this.blur( fun, "dblclick" );
		},

		mousedown: function( fun ) {
			/// <summary>绑定或触发mousedown事件</summary>
			/// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
			/// <returns type="self" />
			return this.blur( fun, "mousedown" );
		},

		mouseup: function( fun ) {
			/// <summary>绑定或触发mouseup事件</summary>
			/// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
			/// <returns type="self" />
			return this.blur( fun, "mouseup" );
		},

		mousemove: function( fun ) {
			/// <summary>绑定或触发mousemove事件</summary>
			/// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
			/// <returns type="self" />
			return this.blur( fun, "mousemove" );
		},

		mouseover: function( fun ) {
			/// <summary>绑定或触发mouseover事件</summary>
			/// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
			/// <returns type="self" />
			return this.blur( fun, "mouseover" );
		},

		mouseout: function( fun ) {
			/// <summary>绑定或触发mouseout事件</summary>
			/// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
			/// <returns type="self" />
			return this.blur( fun, "mouseout" );
		},

		mouseenter: function( fun ) {
			/// <summary>绑定或触发mouseenter事件</summary>
			/// <para>不冒泡</para>
			/// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
			/// <returns type="self" />
			return this.blur( function( e ) {
				fun.apply( this, arguments );
				event.event.document.stopPropagation( e );
			}, "mouseover" );
		},

		mouseleave: function( fun ) {
			/// <summary>绑定或触发mouseleave事件</summary>
			/// <para>不冒泡</para>
			/// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
			/// <returns type="self" />
			return this.blur( function( e ) {
				fun.apply( this, arguments );
				event.event.document.stopPropagation( e );
			}, "mouseout" );
		},

		mousewheel: function( fun ) {
			/// <summary>添加兼容滚轮事件或触发</summary>
			/// <param name="fun" type="Function/Object/undefined">事件方法</param>
			/// <returns type="self" />
			return typed.isFun( fun ) ? this.addHandler( "mousewheel", function( e ) {
				e = $.event.document.getEvent( e );
				var delta = 0;
				if ( e.wheelDelta ) delta = e.wheelDelta / 120;
				if ( e.detail ) delta = -e.detail / 3;
				delta = Math.round( delta );
				if ( delta ) fun.call( this, delta );
				$.event.document.stopPropagation( e );
			} ) : this.trigger( "mousewheel", fun );
		},

		touchwheel: function( fun ) {
			/// <summary>触摸板事件或触发</summary>
			/// <param name="fun" type="Function/Object/undefined">事件方法</param>
			/// <returns type="self" />
			return typed.isFun( fun ) ? this.addHandler( "mousewheel", function( e ) {
				e = $.event.document.getEvent( e );
				var delta = 0,
					direction = "y";
				if ( e.wheelDelta ) {
					delta = e.wheelDelta;
					if ( e.wheelDeltaX ) {
						direction = "x";
					}
					if ( e.wheelDeltaY ) {
						direction = "y";
					}
				} else if ( e.detail ) {
					delta = -e.detail * 40; //40也许太多
				}
				if ( e.axis ) {
					direction = e.axis == 1 ? "x" : "y";
				}
				e.delta = delta;
				e.direction = direction;

				$.event.document.stopPropagation( e );
				$.event.document.preventDefault( e );

				// if (e.type == "DOMMouseScroll") {
				//     e.type = "mousewheel";
				// };
				fun.call( this, e );
			} ) : this.trigger( "mousewheel", fun );
		},

		change: function( fun ) {
			/// <summary>绑定或触发change事件</summary>
			/// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
			/// <returns type="self" />
			return this.blur( fun, "change" );
		},

		select: function( fun ) {
			/// <summary>绑定或触发select事件</summary>
			/// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
			/// <returns type="self" />
			return this.blur( fun, "select" );
		},

		submit: function( fun ) {
			/// <summary>绑定或触发submit事件</summary>
			/// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
			/// <returns type="self" />
			return this.blur( fun, "submit" );
		},

		keydown: function( fun ) {
			/// <summary>绑定或触发keydown事件</summary>
			/// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
			/// <returns type="self" />
			return typed.isFun( fun ) ? this.addHandler( "keydown", function( e ) {
				client.browser.firefox && e.keyCode || ( e.keyCode = e.which );
				e.charCode == undefined && ( e.charCode = e.keyCode );
				fun.call( this, e );
			} ) : this.trigger( "keydown", fun );
		},

		keypress: function( fun ) {
			/// <summary>绑定或触发keypress事件</summary>
			/// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
			/// <returns type="self" />
			return typed.isFun( fun ) ? this.addHandler( "keypress", function( e ) {
				client.browser.firefox && e.keyCode || ( e.keyCode = e.which );
				e.charCode == undefined && ( e.charCode = e.keyCode );
				fun.call( this, e, String.fromCharCode( e.charCode ) );
			} ) : this.trigger( "keypress", fun );
		},

		keyup: function( fun ) {
			/// <summary>绑定或触发keyup事件</summary>
			/// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
			/// <returns type="self" />
			return this.blur( fun, "keyup" );
		},

		error: function( fun ) {
			/// <summary>绑定或触发error事件</summary>
			/// <param name="fun" type="Function/Object/undefined">不存在则触发</param>
			/// <returns type="self" />
			return this.blur( fun, "error" );
		}
	} );

	$.fn.on = $.fn.addHandler;
	$.fn.off = $.fn.removeHandler;
	$.fn.clear = $.fn.clearHandlers;

	for ( i = 0, len = mouse.length; i < len; i++ ) {
		_domEventList[ mouse[ i ] ] = event.event.document.imitation.mouse;
	}
	for ( i = 0, len = mutation.length; i < len; i++ ) {
		_domEventList[ mutation[ i ] ] = 1;
	}
	for ( i = 0, len = key.length; i < len; i++ ) {
		_domEventList[ key[ i ] ] = event.event.document.imitation.key;
	}
	for ( i = 0, len = html.length; i < len; i++ ) {
		_domEventList[ html[ i ] ] = event.event.document.imitation.html;
	}
	for ( i = 0, len = other.length; i < len; i++ ) {
		_domEventList[ other[ i ] ] = 1;
	}

	return event;
} );