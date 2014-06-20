aQuery.define( "main/class", [ "base/extend", "base/support" ], function( $, utilExtend, support, undefined ) {
  "use strict";
  /**
   * @name replaceClass
   * @private
   * @method
   * @param {Element} ele
   * @param {String} oldClassName
   * @param {String} newClassName
   * @returns {this}
   */
  function replaceClass( ele, oldClassName, newClassName ) {
    oldClassName && ( ele.className = ele.className.replace( oldClassName, newClassName ) );
    return this;
  };

  /**
   * @pubilc
   * @exports main/class
   * @requires module:base/extend
   * @requires module:base/support
   * @borrows replaceClass as replaceClass
   */
  var cls;

  if ( support.classList ) {
    cls = /** @lends module:main/class */ {
      /**
       * @param {Element}
       * @param {String}
       * @returns {this}
       */
      addClass: function( ele, className ) {
        className != "" && ele.classList.add( className );
        return this;
      },
      /**
       * @param {Element}
       * @param {String}
       * @returns {Boolean}
       */
      containsClass: function( ele, className ) {
        return ele.classList.contains( className );
      },
      /**
       * @param {Element}
       * @param {String}
       * @returns {this}
       */
      removeClass: function( ele, className ) {
        className != "" && ele.classList.remove( className );
        return this;
      },
      /**
       * If className exists then remove, if className does not exists then add.
       * @param {Element}
       * @param {String}
       * @returns {this}
       */
      toggleClass: function( ele, className ) {
        className != "" && ele.classList.toggle( className );
        return this;
      },
      replaceClass: replaceClass,
      /**
       * return class length.
       * @param {Element}
       * @returns {Number}
       */
      classLength: function( ele ) {
        return ele.classList.length;
      },
      /**
       * If className exists then remove, if className does not exists then add.
       * @param {Element}
       * @param {Number}
       * @returns {String}
       */
      getClassByIndex: function( ele, index ) {
        return ele.classList.item( index );
      }
    };
  } else {
    cls = {
      addClass: function( ele, className ) {
        if ( !cls.containsClass( ele, className ) ) {
          var str = " ";
          if ( ele.className.length == 0 ) str = "";
          ele.className += str + className;
        }

        return this;
      },
      containsClass: function( ele, className ) {
        var reg = new RegExp( "(\\s|^)" + className + "(\\s|$)" ),
          result = ele.className.match( reg );
        return !!( result && result[ 0 ] );
      },
      removeClass: function( ele, className ) {
        if ( cls.containsClass( ele, className ) ) {
          var reg = new RegExp( "(\\s|^)" + className + "(\\s|$)" );
          ele.className = ele.className.replace( reg, " " );
        }
        return this;
      },
      toggleClass: function( ele, className ) {
        cls.containsClass( ele, className ) ? cls.removeClass( ele, className ) : cls.addClass( ele, className );
        return this;
      },
      replaceClass: replaceClass,
      classLength: function( ele ) {
        var
          list = $.util.trim( ele.className ).split( " " ),
          length = list.length;
        return length ? length === 1 && list[ 0 ] === "" ? 0 : length : 0;
      },
      getClassByIndex: function( ele, index ) {
        return ( $.util.trim( ele.className ).split( " " ) )[ index ] || null;
      }
    };
  }

  $.fn.extend( /** @lends aQuery.prototype */ {
    /**
     * @param {String}
     * @returns {this}
     */
    addClass: function( className ) {
      return this.each( function( ele ) {
        cls.addClass( ele, className );
      }, this );
    },
    /**
     * @param {String}
     * @returns {Boolean}
     */
    containsClass: function( className ) {
      return cls.containsClass( this[ 0 ], className );
    },
    /**
     * @param {String}
     * @returns {this}
     */
    removeClass: function( className ) {
      return this.each( function( ele ) {
        cls.removeClass( ele, className );
      } );
    },
    /**
     * @param {String}
     * @returns {this}
     */
    toggleClass: function( className ) {
      return this.each( function( ele ) {
        cls.toggleClass( ele, className );
      } );
    },
    /**
     * @param {String}
     * @param {String}
     * @returns {this}
     */
    replaceClass: function( oldClassName, newClassName ) {
      return this.each( function( ele ) {
        cls.replaceClass( ele, oldClassName, newClassName );
      } );
    },
    /**
     * @returns {Number}
     */
    classLength: function() {
      return cls.classLength( this[ 0 ] );
    },
    /**
     * @param {Number}
     * @returns {String}
     */
    getClassByIndex: function( index ) {
      return cls.getClassByIndex( this[ 0 ], index );
    }
  } );

  return cls;
} );