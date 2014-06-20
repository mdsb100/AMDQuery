aQuery.define( "html5/threed.canvas.extend", [ "base/extend", "html5/canvas", "module/threed" ], function( $, utilExtend, canvas, threed, undefined ) {
  "use strict";
  var Polygon = threed.Polygon;

  utilExtend.easyExtend( Polygon, {
    SOLID: 1,
    WIRE: 0,
    LINE: 1,
    RADIAL: 2,
    RGB: 3,
    RGBA: 4
  } );

  utilExtend.easyExtend( Polygon.prototype, {
    draw: function() {
      this.ctx.sv().b().m( this.points[ 0 ].fx, this.points[ 0 ].fy );

      for ( var i = 0; i < this.points.length; i++ ) {
        this.ctx.l( this.points[ i ].fx, this.points[ i ].fy );
      }

      this.ctx.c().ff( this, function() {
        this.fill.apply( this, this.color );
      } ).rs();

      /*
            // Do lighting here
            lightvector = Math.abs(this.normal.x + this.normal.y);
            if(lightvector > 1) {
            lightvector = 1;
            }

            color[0] = (color[0] * lightvector).toString();
            color[1] = (color[1] * lightvector).toString();
            color[2] = (color[2] * lightvector).toString();
            */

    },
    fill: function( gradient, type, a, b, c, d, e, f ) {
      var color;
      var ctx = this.ctx;
      switch ( gradient ) {
        case Polygon.LINE:
          ctx.lg( a, b, c, d, e, type );
          break;
        case Polygon.RADIAL:
          ctx.rg( a, b, c, d, e, f, type );
          break;
        case Polygon.RGB:
          color = [ "rgb(",
            a, ",",
            b, ",",
            c, ")"
          ].join( "" );

          break;
        case Polygon.RGBA:
          color = [ "rgba(",
            a, ",",
            b, ",",
            c, ",",
            d, ")"
          ].join( "" );
          break;

      }
      switch ( type ) {
        case Polygon.SOLID:
          ctx.s( color );
          break;
        case Polygon.WIRE:
          ctx.f( color );
          break;
      }
    }
  } );
  return;
} );