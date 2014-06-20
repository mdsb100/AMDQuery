aQuery.define( "animation/effect", [ "base/typed", "main/data", "main/css", "animation/animate" ], function( $, typed, utilData, css, animate, undefined ) {
  "use strict";
  var slideDownComplete = function() {
      utilData.set( this, "slideOriginHeight", null );
    },
    slideUpComplete = function( opt ) {
      css.hide( this, opt.visible );
      css.css( this, "height", utilData.get( this, "slideOriginHeight" ) );
      utilData.set( this, "slideOriginHeight", null );
    },
    fadeInComplete = function() {
      utilData.set( this, "slideOriginOpacity", null );
    },
    fadeOutComplete = function( opt ) {
      css.hide( this, opt.visible );
      css.setOpacity( this, utilData.get( this, "slideOriginOpacity" ) );
      utilData.set( this, "slideOriginOpacity", null );
    };

  var effect = {
    fadeIn: function( ele, option ) {
      /// <summary>淡入</summary>
      /// <param name="ele" type="Element">dom元素</param>
      /// <param name="option" type="Object">动画选项</param>
      /// <returns type="self" />
      if ( css.isVisible( ele ) ) {
        return this;
      }

      var o, opt = $._getAnimateOpt( option );
      o = utilData.get( ele, "slideOriginOpacity" );
      o = o != null ? o : ( css.css( ele, "opacity" ) || 1 );

      utilData.set( ele, "slideOriginOpacity", o );
      opt.complete = fadeInComplete;
      css.setOpacity( ele, 0 );
      css.show( ele );
      $.animate( ele, {
        opacity: o
      }, opt );
      return this;
    },
    fadeOut: function( ele, option ) {
      /// <summary>淡出</summary>
      /// <param name="ele" type="Element">dom元素</param>
      /// <param name="option" type="Object">动画选项</param>
      /// <returns type="self" />
      if ( !css.isVisible( ele ) ) {
        return this;
      }
      option = option || {
        visible: 0
      };

      var o, opt = $._getAnimateOpt( option );
      o = utilData.get( ele, "slideOriginOpacity" );
      o = o != null ? o : css.css( ele, "opacity" );

      utilData.set( ele, "slideOriginOpacity", o );
      opt.complete = fadeOutComplete;
      css.show( ele )
      $.animate( ele, {
        opacity: 0
      }, opt );
      return this;
    },

    hide: function( ele, type, option ) {
      /// <summary>隐藏元素
      /// <para>type:slide fade</para>
      /// </summary>
      /// <param name="ele" type="Element">element元素</param>
      /// <param name="type" type="String/undefined">动画类型</param>
      /// <param name="option" type="Object">动画选项</param>
      /// <returns type="self" />
      ///  name="visible" type="Boolean/undefined">true:隐藏后任然占据文档流中
      if ( typed.isString( type ) && effect[ type ] ) {
        effect[ type ]( ele, option );
      } else {
        css.hide( ele );
      }
      return this;
    },

    show: function( ele, type, option ) {
      /// <summary>显示元素
      /// <para>type:slide fade</para>
      /// </summary>
      /// <param name="ele" type="Element">element元素</param>
      /// <param name="type" type="String/undefined">动画类型</param>
      /// <param name="option" type="Object">动画选项</param>
      /// <returns type="self" />
      if ( typed.isString( type ) && effect[ type ] ) {
        effect[ type ]( ele, option );
      } else {
        css.show( ele );
      }
      return this;
    },
    slideDown: function( ele, option ) {
      /// <summary>滑动淡入</summary>
      /// <param name="ele" type="Element">dom元素</param>
      /// <param name="option" type="Object">动画选项</param>
      /// <returns type="self" />
      if ( css.isVisible( ele ) ) {
        return this;
      }

      var h = utilData.get( ele, "slideOriginHeight" ) || css.css( ele, "height" ),
        opt = $._getAnimateOpt( option );
      utilData.set( ele, "slideOriginHeight", h );
      css.css( ele, "height", 0 );
      opt.complete.push( slideDownComplete );
      css.css( ele, "height", 0 );
      css.show( ele )
      $.animate( ele, {
        height: h
      }, opt );
      return this;
    },
    slideUp: function( ele, option ) {
      /// <summary>滑动淡出</summary>
      /// <param name="ele" type="Element">dom元素</param>
      /// <param name="option" type="Object">动画选项</param>
      /// <returns type="self" />
      if ( !css.isVisible( ele ) || utilData.get( ele, "_sliedeDown" ) ) {
        return this;
      }

      var h = utilData.get( ele, "slideOriginHeight" ) || css.css( ele, "height" ),
        opt = $._getAnimateOpt( option );
      css.css( ele, "height", h );
      utilData.set( ele, "slideOriginHeight", h );
      opt.complete.push( slideUpComplete );
      css.show( ele );
      $.animate( ele, {
        height: "0px"
      }, opt );
      return this;
    }
  };

  $.fn.extend( {
    fadeIn: function( option ) {
      /// <summary>淡入</summary>
      /// <param name="option" type="Object">动画选项</param>
      /// <returns type="self" />
      return this.each( function( ele ) {
        effect.fadeIn( ele, option );
      } );
    },
    fadeOut: function( option ) {
      /// <summary>淡出</summary>
      /// <param name="option" type="Object">动画选项</param>
      /// <returns type="self" />
      return this.each( function( ele ) {
        effect.fadeOut( ele, option );
      } );
    },

    hide: function( type, option ) {
      /// <summary>隐藏元素
      /// <para>type:slide fade</para>
      /// </summary>
      /// <param name="type" type="String/undefined">动画类型</param>
      /// <param name="option" type="Object">动画选项</param>
      /// <returns type="self" />
      return this.each( function( ele ) {
        effect.hide( ele, type, option );
      } );
    },

    show: function( type, option ) {
      /// <summary>显示元素
      /// <para>type:slide fade</para>
      /// </summary>
      /// <param name="type" type="String/undefined">动画类型</param>
      /// <param name="option" type="Object">动画选项</param>
      /// <returns type="self" />
      return this.each( function( ele ) {
        effect.show( ele, type, option );
      } );
    },
    slideDown: function( option ) {
      /// <summary>滑动淡入</summary>
      /// <param name="option" type="Object">动画选项</param>
      /// <returns type="self" />
      return this.each( function( ele ) {
        effect.slideDown( ele, option );
      } );
    },
    slideUp: function( option ) {
      /// <summary>滑动淡出</summary>
      /// <param name="option" type="Object">动画选项</param>
      /// <returns type="self" />
      return this.each( function( ele ) {
        effect.slideUp( ele, option );
      } );
    }
  } );

  return effect;
} );