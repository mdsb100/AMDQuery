aQuery.define( "ui/swapview", [
  "base/support",
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
  "module/tween.extend" ], function( $, support, query, css, position, dom, cls, css3, animateTransform, css3Transition, swappable, draggable, Widget, animate, tween, undefined ) {
  "use strict"; //启用严格模式

  var horizental = "H",
    vertical = "V";

  var isTransform3d = !! $.config.module.transitionToAnimation && support.transform3d;
  var swapview = Widget.extend( "ui.swapview", {
    container: null,
    create: function( ) {
      var opt = this.options;

      this.target.uiSwappable( );

      var isHorizental = opt.orientation === horizental;

      this.$board = this.target.children( "ol" );

      this.$board.css( {
        dislplay: "block"
      } ).uiDraggable( {
        keepinner: 1,
        innerWidth: 40,
        innerHeight: 40,
        axis: isHorizental ? "x" : "y",
        stopPropagation: false,
        axisx: isHorizental,
        axisy: !isHorizental,
        isTransform3d: isTransform3d,
        container: this.target,
        overflow: true
      } );

      this.$views = this.$board.children( "li" );

      if ( isHorizental ) {
        this.$views.css( "float", "left" );
      } else {
        this.$views.css( "clear", "left" );
      }

      this.resize();

      return this;
    },
    resize: function( ) {
      var width = this.target.width( );
      var height = this.target.height( );
      this.$views.width( width );
      this.$views.height( height );

      if ( this.options.orientation === horizental ) {
        this.$board.width( width * this.$views.length );
        this.$board.height( height );
      } else {
        this.$board.height( height * this.$views.length );
        this.$board.width( width );
      }

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
      this.target.uiSwappable( "destory", key );
      this.$board.uiDraggable( "destory", key );
      Widget.invoke( "destory", this, key );
    },
    init: function( opt, target ) {
      this._super( opt, target );
      return this.create( )._initHandler( ).enable( ).render( );
    },
    customEventName: [ ],
    options: {
      orientation: horizental
    },
    publics: {

    },
    setter: {
      orientation: Widget.initFirst
    },
    getter: {

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