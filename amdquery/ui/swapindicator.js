aQuery.define( "ui/swapindicator", [
  "base/support",
  "main/query",
  "main/event",
  "main/css",
  "main/position",
  "main/dom",
  "main/class",
  "html5/css3",
  "module/Widget"
   ], function( $, support, query, event, css2, position, dom, cls, css3, Widget ) {
  "use strict";
  Widget.fetchCSS( "ui/css/swapindicator" );
  var horizontal = "H",
    vertical = "V";
  var eventFuns = event.event.document;

  var swapindicator = Widget.extend( "ui.swapindicator", {
    create: function( ) {
      var opt = this.options;

      var isHorizental = opt.orientation === horizontal;

      this.target.css( {
        display: "block",
        position: "relative",
        cursor: "pointer"
      } ).addClass( "swapindicator" );

      this.$indicators = this.target.children( 'li' );

      if ( isHorizental ) {
        this.$indicators.css( "float", "left" );
      } else {
        this.$indicators.css( "clear", "left" );
      }

      this.resize( ).layout( );

      return this;
    },
    layout: function( ) {
      var opt = this.options,
        pWidth = this.target.parent( ).width( ),
        pHeight = this.target.parent( ).height( );

      switch ( opt.verticalAlign ) {
        case "top":
          this.target.css( "top", opt.margin );
          break;
        case "middle":
          this.target.css( "top", ( pHeight - this.height ) / 2 );
          break;
        case "bottom":
          this.target.css( "top", pHeight - this.height - opt.margin );
          break;
      }
      switch ( opt.horizontalAlign ) {
        case "left":
          this.target.css( "left", opt.margin );
          break;
        case "center":
          this.target.css( "left", ( pWidth - this.width ) / 2 );
          break;
        case "right":
          this.target.css( "left", pWidth - this.width - opt.margin );
          break;
      }
      return this;
    },
    resize: function( ) {
      var width = this.target.width( );
      var height = this.target.height( );
      this.width = width;
      this.height = height;

      if ( this.options.orientation === horizontal ) {
        this.$indicators.width( width / this.$indicators.length );
        this.$indicators.height( height );
      } else {
        this.$indicators.width( width );
        this.$indicators.height( height / this.$indicators.length );
      }
      return this;
    },
    render: function( index ) {
      var opt = this.options,
        originIndex = opt.index,
        self = this;
      if ( index === undefined || index < 0 || index > this.$indicators.length - 1 ) {
        return;
      }

      opt.index = index;

      this.$indicators.eq( originIndex ).removeClass( opt.activeCss );

      this.$indicators.eq( index ).addClass( opt.activeCss );

    },
    previous: function( ) {
      return this.render( Math.max( 0, this.options.index - 1 ) );
    },
    next: function( ) {
      return this.render( Math.min( this.options.index + 1, this.$views.length - 1 ) );
    },
    _setIndex: function( index ) {
      this.render( index );
    },
    _setHorizontalAlign: function( str ) {
      this.options.horizontalAlign = str;
      this.layout( );
    },
    _setVerticalAlign: function( str ) {
      this.options.verticalAlign = str;
      this.layout( );
    },
    enable: function( ) {
      this.target.on( "click mousedown", this.event );
      this.options.disabled = true;
      return this;
    },
    disable: function( ) {
      this.target.off( "click mousedown", this.event );
      this.options.disabled = false;
      return this;
    },
    _initHandler: function( ) {
      var self = this,
        target = self.target,
        opt = self.options;

      this.event = function( e ) {
        switch ( e.type ) {
          case "mousedown":
          case "touchstart":
            eventFuns.stopPropagation( e );
            break;
          case "click":
            var type = self.getEventName( "change" ),
              index = $( this ).index( );
            self.render( index );
            target.trigger( type, self, {
              type: type,
              index: index
            } );
            break;
        }
      };
      return this;
    },
    init: function( opt, target ) {
      this._super( opt, target );
      this.width = 0;
      this.height = 0;
      return this.create( )._initHandler( ).enable( ).render( this.options.index );
    },
    customEventName: [ "change" ],
    options: {
      index: 0,
      orientation: horizontal,
      horizontalAlign: "center",
      verticalAlign: "bottom",
      margin: 15,
      activeCss: "active",
      position: "auto"
    },
    publics: {
      render: Widget.AllowPublic,
      orevious: Widget.AllowPublic,
      next: Widget.AllowPublic,
      layout: Widget.AllowPublic
    },
    setter: {
      orientation: Widget.initFirst
    },
    getter: {

    },
    target: null,
    toString: function( ) {
      return "ui.swapindicator";
    },
    widgetEventPrefix: "swapindicator",
    initIgnore: true
  } );

  return swapindicator;
} );