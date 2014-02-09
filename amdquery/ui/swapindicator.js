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
	var HORIZONTAL = "H",
		VERTICAL = "V";
	var eventFuns = event.document;

	var swapindicator = Widget.extend( "ui.swapindicator", {
		create: function() {
			var opt = this.options;

			this.$indicators = null;
			this.target.css( {
				display: "block",
				position: "relative",
				cursor: "pointer"
			} ).addClass( "aquery-swapindicator" );

			this.detect();

			return this;
		},
		detect: function() {
			this.$indicators = this.target.children( 'li' );

			if ( this.options.orientation === HORIZONTAL ) {
				this.$indicators.css( "float", "left" );
			} else {
				this.$indicators.css( "clear", "left" );
			}

			this.resize();
		},
		layout: function() {
			var opt = this.options,
				pWidth = this.target.parent().width(),
				pHeight = this.target.parent().height();

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
		resize: function() {
			var width = this.target.width();
			var height = this.target.height();
			this.width = width;
			this.height = height;

			if ( this.options.orientation === HORIZONTAL ) {
				this.$indicators.width( width / this.$indicators.length );
				this.$indicators.height( height );
			} else {
				this.$indicators.width( width );
				this.$indicators.height( height / this.$indicators.length );
			}
			this.layout();
			return this;
		},
		append: function( li ) {
			this.target.append( li );
			this.detect();
		},
		remove: function( removeIndex, renderIndex ) {
			var $indicator = this.$indicators.eq( removeIndex );
			if ( !$indicator.length ) {
				return;
			}
			$indicator.remove();
			this.detect();
			this.render( renderIndex && renderIndex <= this.$indicators.length ? renderIndex : 0 );
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
		previous: function() {
			return this.render( Math.max( 0, this.options.index - 1 ) );
		},
		next: function() {
			return this.render( Math.min( this.options.index + 1, this.$views.length - 1 ) );
		},
		_setIndex: function( index ) {
			this.render( index );
		},
		_setHorizontalAlign: function( str ) {
			this.options.horizontalAlign = str;
			this.layout();
		},
		_setVerticalAlign: function( str ) {
			this.options.verticalAlign = str;
			this.layout();
		},
		enable: function() {
			this.target.on( "click mousedown", this.swapindicatorEvent );
			this.options.disabled = false;
			return this;
		},
		disable: function() {
			this.target.off( "click mousedown", this.swapindicatorEvent );
			this.options.disabled = true;
			return this;
		},
		_initHandler: function() {
			var self = this,
				target = self.target,
				opt = self.options;

			this.swapindicatorEvent = function( e ) {
				switch ( e.type ) {
					case "mousedown":
					case "touchstart":
						eventFuns.stopPropagation( e );
						break;
					case "click":
						var type = self.getEventName( "change" ),
							index = $( this ).index();
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
			return this.create()._initHandler().enable().render( this.options.index );
		},
		customEventName: [ "change" ],
		options: {
			index: 0,
			orientation: HORIZONTAL,
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
			resize: Widget.AllowPublic,
			layout: Widget.AllowPublic,
			append: Widget.AllowPublic,
			remove: Widget.AllowPublic
		},
		setter: {
			orientation: Widget.initFirst
		},
		getter: {

		},
		target: null,
		toString: function() {
			return "ui.swapindicator";
		},
		widgetEventPrefix: "swapindicator",
		initIgnore: true
	} );

	return swapindicator;
} );