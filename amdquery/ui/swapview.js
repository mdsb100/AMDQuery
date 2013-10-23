aQuery.define( "ui/swapview", [
  "base/config",
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
  "module/Widget",
  "module/animate",
  "module/FX",
  "module/tween.extend",
  "ui/swappable",
  "ui/draggable",
  "ui/swapindicator"
 ], function( $,
  config,
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
  Widget,
  animate,
  FX,
  tween,
  swappable,
  draggable,
  swapindicator,
  undefined ) {
  "use strict";
  var horizontal = "H",
    vertical = "V";

  var isTransform3d = !! config.ui.isTransform3d && support.transform3d;
  var swapview = Widget.extend( "ui.swapview", {
    container: null,
    create: function( ) {
      var opt = this.options;

      this.target.uiSwappable( );

      var isHorizental = opt.orientation === horizontal;

      this.container = this.target.children( "ol" ).eq( 0 );

      this.$views = this.container.children( "li" );
      var indicator = this.target.children( 'ol[ui-swapindicator]' ).eq( 0 );
      this.$indicator = indicator.length ? indicator.uiSwapindicator( ) : null;

      this.container.css( {
        dislplay: "block"
      } ).uiDraggable( {
        keepinner: 1,
        stopPropagation: false,
        vertical: !isHorizental,
        horizontal: isHorizental,
        container: this.target,
        overflow: true
      } );

      if ( isHorizental ) {
        this.$views.css( "float", "left" );
      } else {
        this.$views.css( "clear", "left" );
      }

      this.resize( );

      return this;
    },
    resize: function( ) {
      var width = this.target.width( );
      var height = this.target.height( );
      this.width = width;
      this.height = height;

      this.orientationLength = this.options.orientation == horizontal ? this.width : this.height;

      this.$views.width( width );
      this.$views.height( height );

      if ( this.options.orientation === horizontal ) {
        this.boardWidth = width * this.$views.length;
        this.boardHeight = height;


      } else {
        this.boardWidth = width;
        this.boardHeight = height * this.$views.length;
      }

      this.container.width( this.boardWidth );
      this.container.height( this.boardHeight );

      this.container.uiDraggable( {
        innerWidth: width / 4,
        innerHeight: height / 4
      } );

      this.$indicator && this.$indicator.uiSwapindicator( "resize" );
    },
    toPosition: function( ) {
      var pos = {}, opt = this.options;
      if ( opt.orientation == horizontal ) {
        pos.x = -this.target.width( ) * opt.index;
      } else {
        pos.y = -this.target.height( ) * opt.index;
      }
      this.container.setPositionXY( isTransform3d, pos );
    },
    render: function( index ) {
      var opt = this.options,
        originIndex = opt.index,
        self = this;
      if ( index === undefined || index < 0 || index > this.$views.length - 1 ) {
        return;
      }

      opt.index = index;

      var activeView = $( this.$views[ index ] ),
        deactiveView = $( this.$views[ originIndex ] );
      var animationOpt;

      if ( opt.orientation == horizontal ) {
        animationOpt = $.getPositionAnimationOptionProxy( isTransform3d, -this.target.width( ) * index );
      } else {
        animationOpt = $.getPositionAnimationOptionProxy( isTransform3d, undefined, -this.target.height( ) * index );
      }

      var animationEvent = {
        type: this.getEventName( "beforeAnimation" ),
        target: this.container[ 0 ],
        view: this.$views[ index ],
        index: index
      };
      this.target.trigger( animationEvent.type, animationEvent.target, animationEvent );


      if ( originIndex !== index ) {
        deactiveView.trigger( "beforeDeactive", deactiveView[ index ], {
          type: "beforeDeactive"
        } );
        activeView.trigger( "beforeActive", activeView[ index ], {
          type: "beforeActive"
        } );
      }

      this.container.animate( animationOpt, {
        duration: opt.animationDuration,
        easing: opt.animationEasing,
        queue: false,
        complete: function( ) {
          self.$indicator && self.$indicator.uiSwapindicator( "option", "index", index );
          animationEvent.type = "afterAnimation";
          self.target.trigger( animationEvent.type, animationEvent.target, animationEvent );
          if ( originIndex !== index ) {
            deactiveView.trigger( "deactive", deactiveView[ index ], {
              type: "deactive"
            } );
            activeView.trigger( "active", activeView[ index ], {
              type: "deactive"
            } );
          }
        }
      } );
    },
    swapPrevious: function( ) {
      return this.render( Math.max( 0, this.options.index - 1 ) );
    },
    swapNext: function( ) {
      return this.render( Math.min( this.options.index + 1, this.$views.length - 1 ) );
    },
    _setIndex: function( index ) {
      this.render( index );
    },
    enable: function( ) {
      var event = this.event;
      this.container.on( "drag.start", event );
      this.target.on( "swap.stop swap.none", event );
      this.options.detectFlexResize && this.target.on( "flex.resize", event );
      this.$indicator && this.$indicator.on( "swapindicator.change", event );
      this.options.disabled = true;
      return this;
    },
    disable: function( ) {
      var event = this.event;
      this.container.off( "drag.start", event );
      this.target.off( "swap.stop swap.none", event );
      this.options.detectFlexResize && this.target.on( "flex.resize", event );
      this.$indicator && this.$indicator.off( "swapindicator.change", event );
      this.options.disabled = false;
      return this;
    },
    stopAnimation: function( ) {
      this.container.stopAnimation( true );
      return this;
    },
    _initHandler: function( ) {
      var self = this,
        target = self.target,
        opt = self.options;

      this.event = function( e ) {
        switch ( e.type ) {
          case "drag.start":
            self.stopAnimation( );
            // self.resize();
            break;
          case "swap.stop":
            self._acceptSwapBehavior( e );
            break;
          case "swap.none":
            self.render( opt.index );
            break;
          case "swapindicator.change":
            self.render( e.index );
            break;
          case "flex.resize":
            self.resize( );
            self.toPosition( );
            break;
        }
      };
      return this;
    },
    _acceptSwapBehavior: function( e ) {
      var opt = this.options,
        acceleration = e.acceleration * 1000, //px/s
        //duration = opt.animateDuration - e.duration,
        direction = e.direction,
        distance = e.distance,
        status = acceleration > 2 || distance > this.orientationLength / 4;

      switch ( direction ) {
        case 3:
          if ( opt.orientation === horizontal && status ) {
            return this.swapPrevious( );
          }
          break;
        case 9:
          if ( opt.orientation === horizontal && status ) {
            return this.swapNext( );
          }
          break;
        case 6:
          if ( opt.orientation === vertical && status ) {
            return this.swapPrevious( );
          }
          break;
        case 12:
          if ( opt.orientation === vertical && status ) {
            return this.swapNext( );
          }
          break;
      }

      return this.render( opt.index );
    },
    destroy: function( key ) {
      this.target.uiSwappable( "destroy" );
      this.container.uiDraggable( "destroy" );
      this.$swapindicator && this.$swapindicator.uiSwapindicator( "destroy" );
      Widget.invoke( "destroy", this, key );
    },
    init: function( opt, target ) {
      this._super( opt, target );
      this.width = 0;
      this.height = 0;
      this.boardWidth = 0;
      this.boardHeight = 0;
      this.orientationLength = 0;
      return this.create( )._initHandler( ).enable( ).render( opt.index );
    },
    customEventName: [ "beforeAnimation", "afterAnimation" ],
    options: {
      index: 0,
      orientation: horizontal,
      animationDuration: FX.normal,
      animationEasing: "expo.easeInOut",
      detectFlexResize: true
    },
    publics: {
      render: Widget.AllowPublic,
      swapPrevious: Widget.AllowPublic,
      swapNext: Widget.AllowPublic
    },
    setter: {
      orientation: Widget.initFirst,
      detectFlexResize: Widget.initFirst
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