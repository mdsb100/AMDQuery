aQuery.define( "module/Widget", [
  "base/typed",
  "base/extend",
  "base/array",
  "main/data",
  "main/query",
  "main/event",
  "main/attr",
  "main/object",
  "module/src",
  "module/utilEval"
 ], function(
  $,
  typed,
  utilExtend,
  array,
  data,
  query,
  event,
  attr,
  object,
  src,
  utilEval,
  undefined ) {
  "use strict"; //启用严格模式

  var prefix = "amdquery";

  function getWidgetsName( eles ) {
    var widgetNames = [ ],
      widgetMap = {};

    eles.each( function( ele ) {
      var attrNames = Widget.getAttrWidgets( ele ),
        len = attrNames.length,
        widgetName,
        widgetPath,
        temp,
        i = 0;
      for ( ; i < len; i++ ) {
        widgetName = attrNames[ i ];
        if ( widgetName ) {

          widgetPath = widgetName.replace( ".", "/" );

          if ( !widgetMap[ widgetName ] ) {
            widgetNames.push( widgetPath );

            widgetMap[ widgetName ] = true;
          }
        }
      }

    } );

    return widgetNames;
  }


  function Widget( obj, target ) {
    /// <summary>组件的默认基类</summary>
    /// <para></para>
    /// <param name="obj" type="Object">构造函数</param>
    /// <param name="target" type="$">$对象</param>
    /// <returns type="Widget" />

    this.init( obj.target );
  }

  Widget.AllowPublic = 1;
  Widget.AllowReturn = 2;

  Widget.initFirst = 2;

  var booleanExtend = function( a, b ) {
    for ( var i in b ) {
      if ( b[ i ] == 0 ) {
        a[ i ] = 0;
      } else {
        if ( typed.isBol( a[ i ] ) || typed.isNum( a[ i ] ) ) {

        } else {
          a[ i ] = b[ i ];
        }
      }
    }
  },
    _extendAttr = function( key, constructor, booleanCheck ) {
      /*出了option 其他应该扩展到prototype上*/
      var subValue = constructor.prototype[ key ],
        superConstructor = constructor.prototype.__superConstructor,
        superValue = superConstructor.prototype[ key ],
        newValue = {};

      var extend;

      utilExtend.easyExtend( newValue, superValue );

      if ( subValue != undefined ) {
        if ( booleanCheck ) {
          extend = booleanExtend;
        } else {
          extend = $.easyExtend;
        }
        extend( newValue, subValue );
      }

      constructor.prototype[ key ] = newValue;
    },
    _initOptionsPurview = function( constructor ) {
      var proto = constructor.prototype,
        getter = {},
        setter = {},
        options = proto.options || {},
        i;

      utilExtend.easyExtend( getter, proto.getter );
      utilExtend.easyExtend( setter, proto.setter );

      for ( i in options ) {
        if ( getter[ i ] === undefined ) {
          getter[ i ] = 1;
        }
        if ( setter[ i ] === undefined ) {
          setter[ i ] = 1;
        }
      }

      proto.getter = getter;

      proto.setter = setter;
    },
    extendTemplate = function( tName, prototype, statics ) {
      if ( typed.isObj( statics ) ) {
        return Widget.extend( tName, prototype, statics, this.ctor );
      } else {
        return Widget.extend( tName, prototype, this.ctor );
      }
    },
    invokeTemplate = function( ) {
      return this.ctor.invoke.apply( this.ctor, arguments );
    };


  object.extend( Widget, {
    addTag: function( ) {
      var tag = this.toString( ),
        optionAttr = this.widgetNameSpace + "-" + this.widgetName,
        optionTag = this.target.attr( optionAttr ),
        widgetAttr = prefix + "-widget",
        widgetTag = this.target.attr( widgetAttr );

      if ( widgetTag == undefined ) {
        this.target.attr( widgetAttr, tag );
      } else {
        var reg = new RegExp( "(\\W|^)" + tag + "(\\W|$)" ),
          result = widgetTag.match( reg ),
          symbol = widgetTag.length ? ";" : "";

        if ( !result || !result[ 0 ] ) {
          widgetTag = widgetTag.replace( /\W$/, "" ) + symbol + tag + ";";
          this.target.attr( widgetAttr, widgetTag );
        }
      }

      if ( !optionTag ) {
        this.target.attr( optionAttr, "" );
      }

      return this;
    },
    removeTag: function( ) {
      var tag = this.toString( ),
        optionAttr = prefix + "-" + this.widgetNameSpace + "-" + this.widgetName,
        optionTag = this.target.attr( optionTag ),
        widgetAttr = prefix + "-widget",
        widgetTag = this.target.attr( widgetAttr );

      if ( widgetTag != undefined ) {
        var reg = new RegExp( "(\\W|^)" + tag + "(\\W|$)", "g" );
        widgetTag = widgetTag.replace( reg, ";" ).replace( /^\W/, "" );
        this.target.attr( widgetAttr, widgetTag );
      }

      if ( optionTag == "" ) {
        this.target.removeAttr( optionAttr );
      }

      return this;
    },
    checkAttr: function( ) {
      var key, attr, value, item, result = {}, i = 0,
        j = 0,
        len = 0,
        events,
        widgetName = this.widgetName,
        eventNames = this.customEventName;
      /*check event*/
      for ( i = 0, len = eventNames.length; i < len; i++ ) {
        item = eventNames[ i ];
        key = this.widgetNameSpace + "-" + widgetName + "-" + item;
        attr = this.target.attr( key );
        if ( attr !== undefined ) {
          events = attr.split( ";" );
          for ( j = events.length - 1; j >= 0; j-- ) {
            value = events[ j ].split( ":" );
            result[ item ] = utilEval.functionEval( value[ 0 ], value[ 1 ] || window );
          }
        }
      }

      attr = this.target.attr( this.widgetNameSpace + "-" + widgetName ) || this.target.attr( this.widgetName );

      /*check options*/
      if ( typed.isStr( attr ) ) {
        attr = attr.split( /;|,/ );
        for ( i = 0, len = attr.length; i < len; i++ ) {
          item = attr[ i ].split( ":" );
          if ( item.length == 2 ) {
            key = item[ 0 ];
            if ( $.reg.id.test( item[ 1 ] ) ) {
              result[ key ] = $( item[ 1 ] )[ 0 ];
            } else if ( this.options[ key ] !== undefined ) {
              result[ key ] = utilEval.evalBasicDataType( item[ 1 ] );
            } else if ( array.inArray( this.customEventName, key ) > -1 ) {
              result[ key ] = utilEval.functionEval( item[ 1 ], $ );
            }
          }
        }
      }

      return result;
    },
    create: function( ) {},
    container: null,
    constructor: Widget,
    destory: function( key ) {
      /*应当返回原先的状态*/

      //this.destoryChildren();
      this.disable( );
      this.removeTag( );
      var i = 0,
        name;
      for ( i = this.customEventName.length - 1; i >= 0; i-- ) {
        this.target.clearHandlers( this.widgetEventPrefix + "." + this.customEventName[ i ] );
      }

      this.container && this.options.removeContainer && $( this.container ).remove( );

      for ( i in this ) {
        name = i;
        !typed.isPrototypeProperty( this, name ) && ( this[ name ] = null ) && delete this[ name ];
      }
      if ( key ) {
        this.target.removeData( key );
      }
      return this;
    },
    able: function( ) {
      this.options.disabled === false ? this.disable( ) : this.enable( );
    },
    disable: function( ) {
      this.options.disabled = false;
      return this;
    },
    enable: function( ) {
      this.options.disabled = true;
      return this;
    },
    event: function( ) {},

    init: function( obj, target ) {
      var proto = this.constructor.prototype;

      //元素本身属性高于obj
      this.options = {};
      utilExtend.easyExtend( this.options, proto.options );

      target._initHandler( );
      this.target = target;
      this.addTag( );
      obj = typed.isPlainObj( obj ) ? obj : {};
      utilExtend.extend( obj, this.checkAttr( ) );
      this.option( obj );
      return this;
    },
    instanceofWidget: function( item ) {
      var constructor = item;
      if ( typed.isStr( item ) ) {
        constructor = Widget.get( item );
      }
      if ( typed.isFun( constructor ) ) {
        return constructor.forinstance ? constructor.forinstance( this ) : ( this instanceof constructor );
      }
      return false;
    },
    equals: function( item ) {
      if ( this.forinstance( item ) ) {
        return this.getElement( ) === item.getElement( ) && this[ this.widgetName ]( "getSelf" ) === item[ this.widgetName ]( "getSelf" );
      }
      return false;
    },
    option: function( key, value ) {
      if ( typed.isObj( key ) ) {
        for ( var name in key ) {
          this.setOption( name, key[ name ] );
        }
      } else if ( value === undefined ) {
        return this.getOption( key );
      } else if ( typed.isStr( key ) ) {
        this.setOption( key, value );
      }
    },
    customEventName: [ ],
    options: {
      disabled: 1
    },
    getter: {
      disabled: 1
    },
    setter: {
      disabled: 0
    },
    publics: {
      disable: Widget.AllowPublic,
      enable: Widget.AllowPublic,
      toString: Widget.AllowReturn,
      getSelf: Widget.AllowReturn,
      instanceofWidget: Widget.AllowReturn,
      equals: Widget.AllowReturn,
      beSetter: Widget.AllowReturn,
      beGetter: Widget.AllowReturn
    },
    getEventName: function( name ) {
      return this.widgetEventPrefix + "." + name;
    },
    render: function( ) {},
    _initHandler: function( ) {},
    _getInitHandler: function( Super, context ) {
      var originEvent = this.event;
      Super.invoke( "_initHandler", context );
      var superEvent = this.event;
      this.event = originEvent;
      return superEvent;
    },

    _isEventName: function( name ) {
      return array.inArray( this.customEventName, name ) > -1;
    },
    setOption: function( key, value ) {
      if ( this.beSetter( key ) && this.options[ key ] !== undefined ) {
        this.doSpecialSetter( key, value );
      } else if ( typed.isFun( value ) && this._isEventName( key ) ) {
        this.target.addHandler( this.widgetEventPrefix + "." + key, value );
      }
    },
    getOption: function( key ) {
      if ( this.beGetter( key ) ) {
        return this.doSpecialGetter( key );
      } else {
        if ( this.options[ key ] !== undefined ) {
          $.console.error( "widget:" + this.toString( ) + " can not get option " + key + "; please check getter" );
        } else {
          $.console.error( "widget:" + this.toString( ) + " option " + key + " is undefined; please check options" );
        }
        return undefined;
      }
    },
    doSpecialGetter: function( key ) {
      var fn = this[ $.util.camelCase( key, "_get" ) ];
      return typed.isFun( fn ) ? fn.call( this ) : this.options[ key ];
    },
    doSpecialSetter: function( key, value ) {
      var flag = "__" + key + "OptionInitFirstFlag";
      if ( this.setter[ key ] === Widget.initFirst ) {
        if ( this[ flag ] ) {
          return;
        } else {
          this[ flag ] = true;
        }
      }
      var fn = this[ $.util.camelCase( key, "_set" ) ];
      typed.isFun( fn ) ? fn.call( this, value ) : ( this.options[ key ] = value );
    },
    beGetter: function( key ) {
      return !!this.getter[ key ];
    },
    beSetter: function( key ) {
      return !!this.setter[ key ];
    },
    toString: function( ) {
      return "ui.widget";
    },
    getSelf: function( ) {
      return this;
    },
    widgetEventPrefix: "",
    //将来做事件用
    widgetName: "Widget",

    widgetNameSpace: "ui",

    initIgnore: false
  }, {
    extend: function( name, prototype, statics, Super ) {
      /// <summary>为$添加部件
      /// <para>作为类得constructor可以这样</para>
      /// <para>function TimePicker(obj, target, base){</para>
      /// <para>      base.call(this, obj, target);</para>
      /// <para>}</para>
      /// <para>方法会被传入3个参数。obj为初始化参数、target为$的对象、base为Widget基类</para>
      /// <para>prototype应当实现的属性:container:容器 options:参数 target:目标$ publics:对外公开的方法 widgetEventPrefix:自定义事件前缀</para>
      /// <para>prototype应当实现的方法:返回类型 方法名 this create, this init, this render,Object event</para>
      /// <para>prototype.publics为对外公开的方法，父类覆盖子类遵从于private</para>
      /// <para>prototype.returns 为对外共开方法是否返回一个自己的值 否则将会默认返回原 $对象</para>
      /// <para>prototype.options为参数子类扩展父类</para>
      /// <para>prototype.getter属性器，子类扩展与父类，但遵从于private</para>
      /// <para>prototype.setter属性器，子类扩展与父类，但遵从于private</para>
      /// <para>prototype.customEventName事件列表，子类覆盖父类</para>
      /// <para>对外公开的方法返回值不能为this只能使用getSelf</para>
      /// </summary>
      /// <param name="name" type="String">格式为"ui.scorePicker"ui为命名空间，scorePicer为方法名，若有相同会覆盖</param>
      /// <param name="prototype" type="Object">类的prototype 或者是基widget的name</param>
      /// <param name="statics" type="Object">类的静态方法</param>
      /// <param name="Super" type="Function/undefined">基类</param>
      /// <returns type="Function" />
      //consult from jQuery.ui
      if ( !typed.isStr( name ) ) return null;
      name = name.split( "." );
      var nameSpace = name[ 0 ];
      name = name[ 1 ];


      if ( !nameSpace || !name ) return;
      if ( !Widget[ nameSpace ] ) Widget[ nameSpace ] = {};

      if ( typed.isFun( arguments[ arguments.length - 1 ] ) ) {
        Super = arguments[ arguments.length - 1 ];
      } else {
        Super = Widget;
      }

      if ( !typed.isObj( statics ) ) {
        statics = {};
      }

      var ctor = object.extend( name, prototype, Super );
      ctor.prototype.widgetName = name;
      ctor.prototype.widgetNameSpace = nameSpace;

      Widget[ nameSpace ][ name ] = ctor;

      /*如果当前prototype没有定义setter和getter将自动生成*/
      _initOptionsPurview( ctor );

      _extendAttr( "publics", ctor, prototype, true );
      _extendAttr( "options", ctor );

      /*遵从父级为false 子集就算设为ture 最后也会为false*/
      _extendAttr( "getter", ctor, true );
      _extendAttr( "setter", ctor, true );


      var key = nameSpace + "." + name + $.now( );

      var widget = function( a, b, c ) {
        /// <summary>对当前$的所有元素初始化某个UI控件或者修改属性或使用其方法</summary>
        /// <para>返回option属性或returns方法时，只返回第一个对象的</para>
        /// <param name="a" type="Object/String">初始化obj或属性名:option或方法名</param>
        /// <param name="b" type="String/nul">属性option子属性名</param>
        /// <param name="c" type="any">属性option子属性名的值</param>
        /// <returns type="self" />
        var result = this,
          arg = arguments;
        this.each( function( ele ) {
          var data = $.data( ele, key ); //key = nameSpace + "." + name,
          if ( data == undefined ) data = $.data( ele, key, new ctor( a, $( ele ) ) ); //完全调用基类的构造函数 不应当在构造函数 create render
          else {
            if ( typed.isObj( a ) ) {
              data.option( a );
              data.render( );
            } else if ( typed.isStr( a ) ) {
              if ( a === "option" ) {
                if ( c !== undefined ) {
                  /*若可set 则全部set*/
                  data.option( b, c );
                  data.render( );
                } else {
                  /*若可get 则返回第一个*/
                  result = data.option( b, c );
                  return false;
                }
              } else if ( a === "destory" ) {
                data[ a ].call( data, key );
              } else if ( !! data.publics[ a ] ) {
                var temp = data[ a ].apply( data, $.util.argToArray( arg, 1 ) );
                if ( data.publics[ a ] == Widget.AllowReturn ) {
                  result = temp;
                  return false;
                }
              }
            }
          }
        } );
        return result;
      };

      widget.ctor = ctor;

      widget.extend = extendTemplate;

      widget.invoke = invokeTemplate;

      utilExtend.easyExtend( widget, statics );

      if ( !$.prototype[ name ] ) {
        $.prototype[ name ] = widget;
      }

      $.prototype[ $.util.camelCase( name, nameSpace ) ] = widget;

      return widget;
    },
    is: function( item, widgetName ) {
      /// <summary>是否含某个widget实例</summary>
      /// <param name="item" type="$"></param>
      /// <param name="name" type="String">widget名字 如ui.navmenu</param>
      /// <returns type="Boolean" />
      if ( typed.is$( item ) ) {
        var widgetTag = item.attr( prefix + "-widget" );
        return item.attr( widgetName.replace( ".", "-" ) ) != undefined && widgetTag != undefined && widgetTag.indexOf( widgetName ) > -1;
      }

      return false;
    },
    get: function( name ) {
      /// <summary>获得某个widget</summary>
      /// <param name="name" type="String">widget名字</param>
      /// <returns type="Function" />
      var tName = name.split( "." ),
        tNameSpace = tName[ 0 ];
      tName = tName[ 1 ];
      return Widget[ tNameSpace ][ tName ];
    },
    findWidgets: function( parent ) {
      return $( parent.parentNode || parent ).find( "*[" + prefix + "-widget]" );
    },
    getAttrWidgets: function( ele ) {
      var value = attr.getAttr( ele, prefix + "-widget" ),
        attrNames = typed.isStr( value ) && value != "" ? value.split( /;|,/ ) : [ ],
        widgetName = "",
        i;
      for ( i = attrNames.length - 1; i >= 0; i-- ) {
        widgetName = attrNames[ i ];
        if ( widgetName.indexOf( "." ) < 0 ) {
          attrNames[ i ] = "ui." + widgetName;
        }
      }

      return attrNames;
    },
    fetchCSS: function( path ) {
      if ( $.config.ui.autoFetchCss ) {
        src.link( {
          href: $.getPath( path, ".css" )
        } );
      }
    },
    renderWidget: function( ele, funName ) {
      var widgetNames = Widget.getAttrWidgets( ele ),
        i, widgetName, key, widgetCtor;

      for ( i = widgetNames.length - 1; i >= 0; i-- ) {
        widgetName = widgetNames[ i ];
        widgetCtor = Widget.get( widgetName );
        if ( widgetCtor && widgetCtor.prototype.initIgnore === true ) {
          continue;
        }
        widgetName = widgetName.split( "." );
        key = $.util.camelCase( widgetName[ 1 ], widgetName[ 0 ] );
        if ( $( ele )[ key ] ) {
          $( ele )[ key ]( funName || "" );
        }
      }

      return this;
    },
    initWidgets: function( parent, callback ) {
      var eles = Widget.findWidgets( parent );
      var widgetNames = getWidgetsName( eles );

      if ( widgetNames.length ) {
        require( widgetNames, function( ) {
          for ( var i = 0, len = eles.length; i < len; i++ ) {
            Widget.renderWidget( eles[ i ] );
          }
          callback && callback( );
        } );
      } else {
        callback && callback( );
      }
      return this;
    },
    destoryWidgets: function( parent, callback ) {
      var eles = Widget.findWidgets( parent ).reverse( );
      var widgetNames = getWidgetsName( eles );

      if ( widgetNames.length ) {
        require( widgetNames, function( ) {
          for ( var i = 0, len = eles.length; i < len; i++ ) {
            Widget.renderWidget( eles[ i ], "destory" );
          }
          callback && callback( );
        } );
      } else {
        callback && callback( );
      }
      return this;
    }
  } );

  $.Widget = Widget;

  return Widget;
} );