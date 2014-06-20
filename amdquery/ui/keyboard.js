aQuery.define( "ui/keyboard", [ "main/object", "module/Widget", "module/Keyboard" ], function( $, object, Widget, Keyboard, undefined ) {
  "use strict";
  var allowPublic = Widget.AllowPublic;
  var keyboard = Widget.extend( "ui.keyboard", {
    container: null,
    customEventName: [],
    event: function() {},
    enable: function() {
      this.disable();
      this.keyboard.enable();
      this.options.disabled = false;
      return this;
    },
    disable: function() {
      this.keyboard.disable();
      this.options.disabled = true;
      return this;
    },
    init: function( opt, target ) {
      this._super( opt, target );
      this.keyboard = new Keyboard( target[ 0 ], this.options.keyList );
      this.options.keyList = this.keyboard.keyList;
      this.enable();

      return this;
    },
    options: {
      keyList: []
    },
    _setKeyList: function( keyList ) {
      this.addKeys( keyList );
      this.options.keyList = this.keyboard.keyList;
    },
    publics: {
      addKey: allowPublic,
      addKeys: allowPublic,
      changeKey: allowPublic,
      removeKey: allowPublic,
      removeTodo: allowPublic
    },
    addKey: function( obj ) {
      this.keyboard.addKey( obj );
      this.options.keyList = this.keyboard.keyList;
      return this;
    },
    addKeys: function( keyList ) {
      this.keyboard.addKeys( keyList );
      this.options.keyList = this.keyboard.keyList;
      return this;
    },
    changeKey: function( origin, evolution ) {
      this.keyboard.changeKey( origin, evolution );
      this.options.keyList = this.keyboard.keyList;
      return this;
    },
    removeKey: function( obj ) {
      this.keyboard.removeKey( obj );
      this.options.keyList = this.keyboard.keyList;
      return this;
    },
    removeTodo: function( obj ) {
      this.keyboard.removeTodo( obj );
      this.options.keyList = this.keyboard.keyList;
      return this;
    },
    target: null,
    toString: function() {
      return "ui.keyboard";
    },
    widgetEventPrefix: "keyboard"
  } );

  $.keyboard = function( keyList ) {
    return new Keyboard( document.documentElement, keyList );
  };

  return keyboard;
} );