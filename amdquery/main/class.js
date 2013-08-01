aQuery.define( "main/class", [ "base/extend", "base/support" ], function( $, utilExtend, support, undefined ) {
  "use strict"; //启用严格模式
  var cls,
  replaceClass = function( ele, oldClassName, newClassName ) {
    /// <summary>清空所有样式表</summary>
    /// <param name="ele" type="Element">ele元素</param>
    /// <param name="className" type="String">替换整个样式表 缺省为空</param>
    /// <returns type="self" />
    oldClassName && ( ele.className = ele.className.replace( oldClassName, newClassName ) );
    return this;
  };
  if ( support.classList ) {
    cls = {
      addClass: function( ele, className ) {
        /// <summary>给DOM元素添加样式表</summary>
        /// <param name="ele" type="Element">ele元素</param>
        /// <param name="className" type="String">样式表</param>
        /// <returns type="self" />
        className != "" && ele.classList.add( className );
        return this;
      },
      containsClass: function( ele, className ) {
        /// <summary>获得指定的DOM元素的样式名</summary>
        /// <param name="ele" type="Element">dom元素</param>
        /// <param name="className" type="String">样式名</param>
        /// <returns type="Boolean" />
        return ele.classList.contains( className );
      },
      removeClass: function( ele, className ) {
        /// <summary>对元素删除一个样式类</summary>
        /// <param name="ele" type="Object">对象</param>
        /// <param name="className" type="String">样式名</param>
        /// <returns type="self" />
        className != "" && ele.classList.remove( className );
        return this;
      },
      toggleClass: function( ele, className ) {
        /// <summary>切换元素样式</summary>
        /// <param name="ele" type="Object">对象</param>
        /// <param name="className" type="String">样式名</param>
        /// <returns type="self" />
        className != "" && ele.classList.toggle( className );
        return this;
      },
      replaceClass: replaceClass,
      classLength: function( ele ) {
        /// <summary>获得Class的个数</summary>
        /// <param name="ele" type="Object">对象</param>
        /// <returns type="Number" />
        return ele.classList.length;
      },
      getClassByIndex: function( ele, index ) {
        /// <summary>获得样式在元素的索引</summary>
        /// <param name="ele" type="Object">对象</param>
        /// <param name="index" type="Number">样式名</param>
        /// <returns type="String" />
        return ele.classList.item( index );
      }
    };
  } else {
    cls = {
      addClass: function( ele, className ) {
        /// <summary>给DOM元素添加样式表</summary>
        /// <param name="ele" type="Element">ele元素</param>
        /// <param name="className" type="String">样式表</param>
        /// <returns type="self" />
        if ( !$.containsClass( ele, className ) ) {
          var str = " ";
          if ( ele.className.length == 0 ) str = "";
          ele.className += str + className;
        }

        return this;
      },
      containsClass: function( ele, className ) {
        /// <summary>获得指定的DOM元素的样式名</summary>
        /// <param name="ele" type="Element">dom元素</param>
        /// <param name="className" type="String">样式名</param>
        /// <returns type="String" />
        var reg = new RegExp( "(\\s|^)" + className + "(\\s|$)" ),
          result = ele.className.match( reg );
        return !!( result && result[ 0 ] );
      },
      removeClass: function( ele, className ) {
        /// <summary>对元素删除一个样式类</summary>
        /// <param name="ele" type="Object">对象</param>
        /// <param name="className" type="String">样式名</param>
        /// <returns type="self" />
        if ( $.containsClass( ele, className ) ) {
          var reg = new RegExp( "(\\s|^)" + className + "(\\s|$)" );
          ele.className = ele.className.replace( reg, " " );
        }
        return this;
      },
      toggleClass: function( ele, className ) {
        /// <summary>切换元素样式</summary>
        /// <param name="ele" type="Object">对象</param>
        /// <param name="className" type="String">样式名</param>
        /// <returns type="self" />
        $.containsClass( ele, className ) ? $.removeClass( ele, className ) : $.addClass( ele, className );
        return this;
      },
      replaceClass: replaceClass,
      classLength: function( ele ) {
        /// <summary>获得Class的个数</summary>
        /// <param name="ele" type="Object">对象</param>
        /// <returns type="Number" />
        return ( $.util.trim( ele.className ).split( " " ) ).length;
      },
      getClassByIndex: function( ele, index ) {
        /// <summary>获得样式在元素的索引</summary>
        /// <param name="ele" type="Object">对象</param>
        /// <param name="index" type="Number">样式名</param>
        /// <returns type="String" />
        return ( $.util.trim( ele.className ).split( " " ) )[ index ] || null;
      }
    };
  }

  $.extend( cls );

  $.fn.extend( {
    addClass: function( className ) {
      /// <summary>给所有DOM元素添加样式表</summary>
      /// <param name="className" type="String">样式表</param>
      /// <returns type="self" />
      return this.each( function( ele ) {
        $.addClass( ele, className );
      }, this );
    },
    containsClass: function( className ) {
      /// <summary>第一个元素是否有个样式名</summary>
      /// <param name="className" type="String">样式名</param>
      /// <returns type="Boolean" />
      return $.containsClass( this[ 0 ], className );
    },
    removeClass: function( className ) {
      /// <summary>对所有元素删除一个样式类</summary>
      /// <param name="className" type="String">样式名</param>
      /// <returns type="self" />
      return this.each( function( ele ) {
        $.removeClass( ele, className );
      } );
    },
    toggleClass: function( className ) {
      /// <summary>切换元素样式</summary>
      /// <param name="className" type="String">样式名</param>
      /// <returns type="Number" />
      return this.each( function( ele ) {
        $.toggleClass( ele, className );
      } );
    },
    replaceClass: function( oldClassName, newClassName ) {
      /// <summary>替换元素所有样式</summary>
      /// <param name="className" type="String">样式名</param>
      /// <returns type="self" />
      return this.each( function( ele ) {
        $.replaceClass( ele, oldClassName, newClassName );
      } );
    },
    classLength: function( ) {
      /// <summary>获得Class的个数</summary>
      /// <returns type="Number" />
      return $.classLength( this[ 0 ] );
    },
    getClassByIndex: function( index ) {
      /// <summary>获得样式在元素的索引</summary>
      /// <param name="ele" type="Object">对象</param>
      /// <param name="index" type="Number">样式名</param>
      /// <returns type="String" />
      return $.getClassByIndex( this[ 0 ], index );
    }
  } );

  return cls;
} );