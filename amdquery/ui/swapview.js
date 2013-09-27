aQuery.define( "ui/swapview", [
  "main/query",
  "main/css",
  "main/position",
  "main/dom",
  "main/class",
  "html5/css3",
  "html5/animate.transform",
  "html5/css3.transition.animate",
  "ui/swappable",
  "ui/draggable",
  "module/Widget",
  "module/animate",
  "module/tween.extend" ], function( $, query, css, position, dom, cls, css3, animateTransform, css3Transition, swappable, draggable, Widget, animate, tween, undefined ) {
  "use strict"; //启用严格模式
  var swapview = Widget.extend( "ui.swapview", {
    container: null,
    create: function( ) {
      var opt = this.options;


      return this;
    },
    event: function( ) {},
    enable: function( ) {
      var event = this.event;

      this.options.disabled = true;
      return this;
    },
    disable: function( ) {
      var event = this.event;

      this.options.disabled = false;
      return this;
    },
    _initHandler: function( ) {
      var self = this,
        target = self.target,
        opt = self.options;

      this.event = function( e ) {
        // switch ( e.type ) {

        // }
      };
      return this;
    },
    destory: function( key ) {
      Widget.invoke( "destory", this, key );
    },
    init: function( opt, target ) {
      this._super( opt, target );

      return this.create( )._initHandler( ).enable( ).render( );
    },
    customEventName: [ ],
    options: {

    },
    publics: {

    },
    render: function( ) {

      return this;
    },
    target: null,
    toString: function( ) {
      return "ui.swapview";
    },
    widgetEventPrefix: "swapview"
  } );
} );