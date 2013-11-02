aQuery.define( "base/typed", function( $ ) {
  "use strict"; //启用严格模式
  var
  class2type = {},
    hasOwnProperty = class2type.hasOwnProperty,
    toString = class2type.toString;

  $.each( "Boolean Number String Function Array Date RegExp Object Error".split( " " ), function( name, i ) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase( );
  } );

  var typed = {
    isEleConllection: function( a ) {
      /// <summary>是否为DOM元素的集合</summary>
      /// <param name="a" type="any">任意对象</param>
      /// <returns type="Boolean" />
      return typed.isType( a, "[object NodeList]" ) ||
        typed.isType( a, "[object HTMLCollection]" ) ||
        ( typed.isNum( a.length ) && !typed.isArr( a.length ) &&
        ( a.length > 0 ? typed.isEle( a[ 0 ] ) : true ) &&
        ( typed.isObj( a.item ) || typed.isStr( a.item ) ) );
    },
    isEvent: function( a ) {
      return a && !! ( toString.call( a ).indexOf( "Event" ) > -1 || ( a.type && a.srcElement && a.cancelBubble !== undefined ) || ( a.type && a.target && a.bubbles !== undefined ) )
    },
    isArguments: function( a ) {
      return !!a && "callee" in a && this.isNum( a.length );
    },
    isArr: function( a ) {
      /// <summary>是否为数组</summary>
      /// <param name="a" type="any">任意对象</param>
      /// <returns type="Boolean" />
      return typed.isType( a, "[object Array]" );
    },
    isArrlike: function( obj ) {
      /// <summary>是否像一个数组</summary>
      /// <param name="obj" type="any">任意对象</param>
      /// <returns type="Boolean" />
      var length = obj.length,
        type = typed.type( obj );

      if ( typed.isWindow( obj ) ) {
        return false;
      }

      if ( obj.nodeType === 1 && length ) {
        return true;
      }

      return type === "array" || type !== "function" &&
        ( length === 0 ||
        typeof length === "number" && length > 0 && ( length - 1 ) in obj );
    },

    isArrOf: function( a, type ) {
      /// <summary>是否为某种特定类型数组</summary>
      /// <param name="a" type="any">任意对象</param>
      /// <param name="type" type="Function">检查的方法 可以是typed.isStr</param>
      /// <returns type="Boolean" />
      var result = true;
      if ( typed.isArr( a ) ) {
        $.each( a, function( item ) {
          if ( !( result = type( item ) ) ) {
            return false;
          }
        } );
      } else {
        result = false;
      }
      return result;
    },
    isBol: function( a ) {
      /// <summary>是否为数组</summary>
      /// <param name="a" type="any">任意对象</param>
      /// <returns type="Boolean" />
      return typed.isType( a, "[object Boolean]" );
    },
    isDate: function( a ) {
      /// <summary>是否为日期</summary>
      /// <param name="a" type="any">任意对象</param>
      /// <returns type="Boolean" />
      return typed.isType( a, "[object Date]" );
    },
    isDoc: function( a ) {
      /// <summary>是否为Document</summary>
      /// <param name="a" type="any">任意对象</param>
      /// <returns type="Boolean" />
      return !!toString.call( a ).match( /document/i );
    },
    isEle: function( a ) {
      /// <summary>是否为DOM元素</summary>
      /// <param name="a" type="any">任意对象</param>
      /// <returns type="Boolean" />
      if ( !a || a === document ) return false;
      var str = ( a.constructor && a.constructor.toString( ) ) + Object.prototype.toString.call( a )
      if ( ( str.indexOf( "HTML" ) > -1 && str.indexOf( "Collection" ) == -1 ) || a.nodeType === 1 ) {
        return true;
      }
      return false;
    },
    isEmpty: function( a ) {
      /// <summary>是否为空</summary>
      /// <param name="a" type="any">任意对象</param>
      /// <returns type="Boolean" />
      if ( a == null ) return true;
      if ( typed.isArr( a ) || typed.isStr( a ) ) return a.length == 0;
      return typed.isEmptyObj( a );
    },
    isEmptyObj: function( obj ) {
      /// <summary>是否为空的Object</summary>
      /// <param name="a" type="any">任意对象</param>
      /// <returns type="Boolean" />
      for ( var name in obj ) {
        return false;
      }
      return true;
    },
    isError: function( a ) {
      /// <summary>是否为日期</summary>
      /// <param name="a" type="any">任意对象</param>
      /// <returns type="Boolean" />
      return typed.isType( a, "[object Error]" );
    },
    isFinite: function( a ) {
      /// <summary>是否为Finite</summary>
      /// <param name="a" type="any">任意对象</param>
      /// <returns type="Boolean" />
      return isFinite( a ) && !isNaN( parseFloat( a ) );
    },
    isFun: function( a ) {
      /// <summary>是否为方法</summary>
      /// <param name="a" type="any">任意对象</param>
      /// <returns type="Boolean" />
      return typed.isType( a, "[object Function]" );
    },
    isNativeJSON: function( a ) {
      /// <summary>是否为本地JSON</summary>
      /// <param name="a" type="any">任意对象</param>
      /// <returns type="Boolean" />
      return window.json && typed.isType( a, "object JSON" );
    },
    isNaN: function( a ) {
      /// <summary>是否为NaN</summary>
      /// <param name="a" type="any">任意对象</param>
      /// <returns type="Boolean" />
      return typed.isNum( a ) && a != +a;
    },
    isNum: function( a ) {
      /// <summary>是否为数字</summary>
      /// <param name="a" type="any">任意对象</param>
      /// <returns type="Boolean" />
      return typed.isType( a, "[object Number]" );
    },
    isNumeric: function( a ) {
      return !isNaN( parseFloat( a ) ) && isFinite( a );
    },
    isNul: function( a ) {
      /// <summary>是否为不存在</summary>
      /// <param name="a" type="any">任意对象</param>
      /// <returns type="Boolean" />
      return a === undefined || a === null || a === NaN;
    },
    isNode: function( ele, name ) {
      /// <summary>判断是不是这个dom元素</summary>
      /// <param name="ele" type="Element">dom元素</param>
      /// <param name="name" type="String">名字</param>
      /// <returns type="Boolean" />
      return typed.isEle( ele ) ? ( ele.nodeName && ele.nodeName.toUpperCase( ) === name.toUpperCase( ) ) : false;
    },
    isObj: function( a ) {
      /// <summary>是否为对象</summary>
      /// <param name="a" type="any">任意对象</param>
      /// <returns type="Boolean" />
      return a !== undefined ? typed.isType( a, "[object Object]" ) : false;
    },
    isPlainObj: function( obj ) {
      /// <summary>是否为纯obj</summary>
      /// <param name="obj" type="any">任意对象</param>
      /// <returns type="Boolean" />
      if ( !obj || !typed.isObj( obj ) || obj.nodeType || obj.setInterval ) {
        return false;
      }

      // Not own constructor property must be Object
      if ( obj.constructor && !hasOwnProperty.call( obj, "constructor" ) && !hasOwnProperty.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
        return false;
      }

      // Own properties are enumerated firstly, so to speed up,
      // if last one is own, then all properties are own.
      var key;
      for ( key in obj ) {
        break;
      }

      return key === undefined || hasOwnProperty.call( obj, key );
    },
    isRegExp: function( ) {
      /// <summary>是否为字符产</summary>
      /// <param name="a" type="any">任意对象</param>
      /// <returns type="Boolean" />
      return typed.isType( a, "[object RegExp]" );
    },
    isStr: function( a ) {
      /// <summary>是否为字符产</summary>
      /// <param name="a" type="any">任意对象</param>
      /// <returns type="Boolean" />
      return typed.isType( a, "[object String]" );
    },
    isType: function( a, b ) {
      /// <summary>判断对象类型</summary>
      /// <param name="a" type="any">任意对象</param>
      /// <param name="b" type="String">例:"[object Function]"</param>
      /// <returns type="Boolean" />
      return toString.call( a ) == b;
    },
    isXML: function( ele ) {
      /// <summary>是否是XML</summary>
      /// <param name="ele" type="any">任意对象</param>
      /// <returns type="Boolean" />
      // documentElement is verified for cases where it doesn't yet exist
      // (such as loading iframes in IE - #4833)
      var documentElement = ( ele ? ele.ownerDocument || ele : 0 ).documentElement;

      return documentElement ? documentElement.nodeName !== "HTML" : false;
    },
    isWindow: function( a ) {
      /// <summary>是否为window对象</summary>
      /// <param name="a" type="any">任意对象</param>
      /// <returns type="Boolean" />
      return a != null && a == a.window;
    },
    is$: $.forinstance,
    type: function( obj ) {
      if ( obj == null ) {
        return String( obj );
      }
      return typeof obj === "object" || typeof obj === "function" ?
        class2type[ toString.call( obj ) ] || "object" :
        typeof obj;
    }
  };

  return typed;
}, "1.0.0" );