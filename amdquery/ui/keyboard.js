myQuery.define( "ui/keyboard", [ "main/object", "module/Widget", "module/Keyboard" ], function( $, object, Widget, Keyboard, undefined ) {
  "use strict"; //启用严格模式

  var keyboard = Widget.extend( "ui.keyboard", {
    container: null,
    customEventName: [ ],
    event: function( ) {},
    enable: function( ) {
      this.disable( );
      this.keyBoard.enable( );
      this.options.disabled = true;
      return this;
    },
    disable: function( ) {
      this.keyBoard.disable( );
      this.options.disabled = false;
      return this;
    },
    init: function( opt, target ) {
      this._super( opt, target );
      target.attr( "amdquery-ui", "keyboard" );
      this.keyboard = new Keyboard( target[ 0 ], this.options.keyList );
      this.options.keyList = this.keyboard.keyList;

      return this;
    },
    options: {
      keyList: [ ]
    },
    publics: {
      addKey: Widget.AllowPublic,
      addKeys: Widget.AllowPublic,
      changeKey: Widget.AllowPublic,
      removeKey: Widget.AllowPublic
    },
    addKey: function( obj ) {
      this.keyboard.addKey( obj );
      return this;
    },
    addKeys: function( keyList ) {
      this.keyboard.addKeys( keyList );
      return this;
    },
    changeKey: function( origin, evolution ) {
      this.keyboard.changeKey( origin, evolution );
      return this;
    },
    removeKey: function( obj ) {
      this.keyboard.removeKey( obj );
      return this;
    },
    target: null,
    toString: function( ) {
      return "ui.keyboard";
    },
    widgetEventPrefix: "keyboard"
  } );

  $.keyboard = function( keyList ) {
    return new Keyboard( document.documentElement, keyList );
  };

  //提供注释
  $.fn.uiKeyboard = function( a, b, c, args ) {
    /// <summary>可以参考charcode列表绑定快捷键
    /// <para>arr obj.keylist:快捷键列表</para>
    /// <para>{ type: "keyup", keyCode: "Enter" </para>
    /// <para>    , fun: function (e) { </para>
    /// <para>        todo(this, e); </para>
    /// <para>    }, combinationKey: ["alt","ctrls"] </para>
    /// <para>} </para>
    /// </summary>
    /// <param name="a" type="Object/String">初始化obj或属性名:option或方法名</param>
    /// <param name="b" type="String/null">属性option子属性名</param>
    /// <param name="c" type="any">属性option子属性名的值</param>
    /// <param name="args" type="any">在调用方法的时候，后面是方法的参数</param>
    /// <returns type="$" />
    return keyboard.apply( this, arguments );
  };

  return keyboard;
} );