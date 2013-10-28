aQuery.define( "base/extend", [ "base/typed" ], function( $, typed ) {
  "use strict"; //启用严格模式
  var extend = {
    easyExtend: function( obj1, obj2 ) {
      /// <summary>简单地把对象的属性复制到对象一</summary>
      /// <param name="a" type="Object">对象</param>
      /// <param name="b" type="Object">对象</param>
      /// <returns type="self" />
      for ( var i in obj2 )
        obj1[ i ] = obj2[ i ];
      return this;
    },
    extend: function( a ) {
      /// <summary>制造一个Object元素
      /// <para>第二个参数：待修改对象。如果deep为obj,则以后的参数都应该是纯obj。</para>
      /// <para>第N+2个参数：待合并到target对象的对象。</para>
      /// <para>返回最后被合并的目标Object</para>
      /// </summary>
      /// <param name="a" type="Boolean/Object">如果设为true，则递归合并。如果为纯obj则添加到$中</param>
      /// <returns type="Object" />
      //quote from jQuery-1.4.1
      var target = arguments[ 0 ] || {},
        i = 1,
        length = arguments.length,
        deep = false,
        options, name, src, copy;

      if ( length == 1 && typed.isObj( target ) ) {
        extend.easyExtend( $, target );
        return this;
      }

      if ( typed.isBol( target ) ) {
        deep = target;
        target = arguments[ 1 ] || {};
        i = 2;
      }

      if ( !typed.isObj( target ) && !typed.isFun( target ) ) { //加了个array && !typed.isArr( target )
        target = {};
      }

      if ( length === i ) {
        target = this;
        --i;
      }

      for ( ; i < length; i++ ) {
        if ( ( options = arguments[ i ] ) != null ) {
          for ( name in options ) {
            if ( options.hasOwnProperty( name ) ) {
              src = target[ name ];
              copy = options[ name ];

              if ( target === copy ) {
                continue;
              }

              if ( deep && copy && ( typed.isPlainObj( copy ) || typed.isArr( copy ) ) ) {
                var clone = src && ( typed.isPlainObj( src ) || typed.isArr( src ) ) ? src : typed.isArr( copy ) ? [ ] : {};

                target[ name ] = $.extend( deep, clone, copy );

              } else if ( copy !== undefined ) {
                target[ name ] = copy;
              }
            }
          }
        }
      }

      return target;

    }
  };

  extend.easyExtend( $, extend );

  $.fn.extend = function( params ) {
    /// <summary>把对象属性复制$.prototype上</summary>
    /// <param name="params" type="params:obj">params形式的纯Object对象</param>
    /// <returns type="self" />
    for ( var i = 0, len = arguments.length, obj; i < len; i++ ) {
      obj = arguments[ i ];
      typed.isPlainObj( obj ) && extend.easyExtend( $.prototype, obj );
    }
    return $.fn;
  };

  return extend;
}, "1.0.0" );