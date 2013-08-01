aQuery.define( "base/array", [ "base/typed", "base/extend" ], function( $, typed, extend) {
  "use strict"; //启用严格模式
  var
  indexOf = Array.prototype.indexOf || function( item, i ) {
      var len = this.length;
      i = i || 0;
      if ( i < 0 ) i += len;
      for ( ; i < len; i++ )
        if ( i in this && this[ i ] === item ) return i;
      return -1;
    }, lastIndexOf = Array.prototype.lastIndexOf || function( item, i ) {
      var len = this.length - 1;
      i = i || len;
      if ( i < 0 ) i += len;
      for ( ; i > -1; i-- )
        if ( i in this && this[ i ] === item ) break;
      return i;
    }, push = Array.prototype.push,
    array = {
      grep: function( arr, callback, inv ) {
        var retVal,
          ret = [ ],
          i = 0,
          length = arr.length;
        inv = !! inv;

        // Go through the array, only saving the items
        // that pass the validator function
        for ( ; i < length; i++ ) {
          retVal = !! callback( arr[ i ], i );
          if ( inv !== retVal ) {
            ret.push( arr[ i ] );
          }
        }

        return ret;
      },

      filterArray: function( arr, fun, context ) {
        /// <summary>删选数组</summary>
        /// <param name="arr" type="Array">数组</param>
        /// <param name="fun" type="Function">回调函数</param>
        /// <param name="context" type="Object">作用域</param>
        /// <returns type="Array" />
        var ret = [ ];
        for ( var i = 0, len = arr.length, item; i < len; i++ ) {
          item = arr[ i ];
          fun.call( context, item, i, arr ) == true && ret.push( item );
        }
        return ret;
      },

      filterSame: function( arr ) {
        /// <summary>剔除数组中相同的对象</summary>
        /// <param name="arr" type="Array">数组</param>
        /// <param name="item" type="any">任意对象</param>
        /// <param name="i" type="Number/null">序号 可选</param>
        /// <returns type="Array" />
        if ( arr.length > 1 ) {
          for ( var len = arr.length, list = [ arr[ 0 ] ], result = true, i = 1, j = 0; i < len; i++ ) {
            j = 0;
            for ( ; j < list.length; j++ ) {
              if ( arr[ i ] === list[ j ] ) {
                result = false;
                break;
              }
            }
            result && list.push( arr[ i ] );
            result = true;
          }
          return list;
        } else {
          return arr;
        }
      },

      inArray: function( arr, item, i ) {
        /// <summary>返回数组中于此对象相同的序号</summary>
        /// <param name="arr" type="Array">数组</param>
        /// <param name="item" type="any">任意对象</param>
        /// <param name="i" type="Number/null">序号 可选</param>
        /// <returns type="Number" />
        return indexOf.call( arr, item, i );
      },

      lastInArray: function( arr, item, i ) {
        /// <summary>从后开始遍历返回数组中于此对象相同的序号</summary>
        /// <param name="arr" type="Array">数组</param>
        /// <param name="item" type="any">任意对象</param>
        /// <param name="i" type="Number/null">序号 可选</param>
        /// <returns type="Number" />
        return lastIndexOf.call( arr, item, i );
      },

      makeArray: function( array, results ) {
        /// <summary>制造一个数组</summary>
        /// <param name="array" type="any">任意</param>
        /// <param name="results" type="Array">数组 可缺省</param>
        /// <returns type="Array" />
        //quote from jQuery-1.4.1 
        var result = results || [ ];

        if ( array != null ) {
          if ( array.length == null || typed.isStr( array ) || typed.isFun( array ) || array.setInterval ) {
            push.call( result, array );
          } else {
            result = array.toArray( array );
          }
        }

        return result;
      },

      slice: function( list, num, len ) {
        /// <summary>数组的slice方法</summary>
        /// <param name="list" type="Array">数组</param>
        /// <param name="num" type="Number/null">序号 缺省返回第一个</param>
        /// <param name="len" type="Number/null">长度 返回当前序号后几个元素 缺省返回当前序号</param>
        /// <returns type="Array" />
        return list.slice( typed.isNum( num ) ? num : 0, typed.isNum( len ) ? len + num : 1 + num );
      },

      toArray: function( obj, num1, num2 ) {
        /// <summary>转换成数组</summary>
        /// <param name="num1" type="Number/null">序号 缺省从零开始</param>
        /// <param name="num2" type="Number/null">长度 缺省为整个长度</param>
        /// <returns type="Array" />
        var i = 0,
          list = [ ],
          len = obj.length;
        if ( !( typed.isNum( len ) && typed.isFun( obj ) ) ) {
          for ( var value = obj[ 0 ]; i < len; value = obj[ ++i ] ) {
            list.push( value );
          }
        }
        return list.slice( num1 || 0, num2 || len );

      }
    };

  return array;
}, "1.0.0" );