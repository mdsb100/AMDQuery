aQuery.define( "ui/swapview", [
  "base/support",
  "main/query",
  "main/css",
  "main/position",
  "main/dom",
  "main/class",
  "html5/css3",
  "html5/css3.position",
  "html5/animate.transform",
  "html5/css3.transition.animate",
  "ui/swappable",
  "ui/draggable",
  "module/Widget",
  "module/animate",
  "module/FX",
  "module/tween.extend" ], function( $,
  support,
  query,
  css,
  position,
  dom,
  css2,
  css3,
  css3Position,
  animateTransform,
  css3Transition,
  swappable,
  draggable,
  Widget,
  animate,
  FX,
  tween, undefined ) {
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

      this.container = this.target.children( "ol" );

      this.target.uiSwappable( );

      this.container.css( {
        dislplay: "block"
      } ).uiDraggable( {
        keepinner: 1,
        innerWidth: this.target.width( ) / 4,
        innerHeight: this.target.height( ) / 4,
        axis: isHorizental ? "x" : "y",
        stopPropagation: false,
        axisx: isHorizental,
        axisy: !isHorizental,
        container: this.target,
        overflow: true
      } );

      this.$views = this.container.children( "li" );

      if ( isHorizental ) {
        this.$views.css( "float", "left" );
      } else {
        this.$views.css( "clear", "left" );
      }

      this.resize( );

      return this;
    },
    appendView: function( ) {

    },
    removeView: function( ) {

    },
    insertBeforeView: function( ) {

    },
    resize: function( ) {
      var width = this.target.width( );
      var height = this.target.height( );
      this.width = width;
      this.height = height;

      this.$views.width( width );
      this.$views.height( height );

      if ( this.options.orientation === horizental ) {
        this.boardWidth = width * this.$views.length;
        this.boardHeight = height;


      } else {
        this.boardWidth = height * this.$views.length;
        this.boardHeight = width;
      }

      this.container.width( this.boardWidth );
      this.container.height( this.boardHeight );
    },
    render: function( index ) {
      var opt = this.options,
        self = this;
      if ( index === undefined || index < 0 || index > this.$views.length || opt.index === index ) {
        return;
      }

      opt.index = index;

      var animationOpt;

      if ( opt.orientation == horizental ) {
        animationOpt = $.getPositionAnimationOptionProxy( isTransform3d, -this.width * index );
      } else {
        animationOpt = $.getPositionAnimationOptionProxy( isTransform3d, -this.height * index );
      }
      // this.traget.trigger()
      //点击stop 然后继续 动画
      var animationEvent = {
        type: this.getEventName( "beforeAnimation" ),
        target: this.container[ 0 ],
        view: this.$views[ index ],
        index: index
      }
      this.target.trigger( animationEvent.type, animationEvent.target, animationEvent );

      this.container.animate( animationOpt, {
        duration: opt.animationDuration,
        easing: opt.animationEasing,
        queue: false,
        complete: function( ) {
          animationEvent.type = "afterAnimation";
          self.target.trigger( animationEvent.type, animationEvent.target, animationEvent );
        }
      } );
    },
    _setIndex: function( index ) {
      this.render( index );
    },
    enable: function( ) {
      var event = this.event;
      this.container.on( "drag.pause drag.move drag.start", event );
      this.target.on( "swap.move swap.stop swap.pause", event );
      this.options.disabled = true;
      return this;
    },
    disable: function( ) {
      var event = this.event;
      this.container.off( "drag.pause drag.move drag.start", event );
      this.target.off( "swap.move swap.stop swap.pause", event );
      this.options.disabled = false;
      return this;
    },
    checkSwap: function( e ) {
      var opt = this.options,
        a0 = e.acceleration,
        t0 = opt.animateDuration - e.duration,
        s0 = Math.round( a0 * t0 * t0 * 0.5 ),
        direction = e.direction;

      if ( t0 <= 0 ) {
        this.toYBoundary( this.getTop( ) ).toXBoundary( this.getLeft( ) );
        return this.hideStatusBar( );
      }

      switch ( direction ) {
        case 3:
          this.toX( -s0, t0, direction );
          break;
        case 9:
          this.toX( s0, t0, direction );
          break;
        case 6:
          this.toY( -s0, t0, direction );
          break;
        case 12:
          this.toY( s0, t0, direction );
          break;
        default:
          this.toXBoundary( this.getTop( ) ).toYBoundary( this.getLeft( ) );
      }

      return this;
    },
    _initHandler: function( ) {
      var self = this,
        target = self.target,
        opt = self.options;

      this.event = function( e ) {
        switch ( e.type ) {
          case "drag.stop":

            break;
          case "swap.stop":
            console.log( "!!!!" )
            break;
        }
      };
      return this;
    },
    destory: function( key ) {
      this.target.uiSwappable( "destory", key );
      this.container.uiDraggable( "destory", key );
      Widget.invoke( "destory", this, key );
    },
    init: function( opt, target ) {
      this._super( opt, target );
      this.width = 0;
      this.height = 0;
      this.boardWidth = 0;
      this.boardHeight = 0;
      return this.create( )._initHandler( ).enable( ).render( );
    },
    customEventName: [ "beforeAnimation", "afterAnimation" ],
    options: {
      index: 0,
      orientation: horizental,
      animationDuration: FX.normal,
      animationEasing: "expo.easeInOut"
    },
    publics: {
      render: Widget.AllowPublic
    },
    setter: {
      orientation: Widget.initFirst
    },
    getter: {

    },
    target: null,
    toString: function( ) {
      return "ui.swapview";
    },
    widgetEventPrefix: "swapview"
  } );
} );