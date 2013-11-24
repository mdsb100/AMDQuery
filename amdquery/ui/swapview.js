aQuery.define( "ui/swapview", [
  "base/config",
  "base/support",
  "base/typed",
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
	typed,
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
	var HORIZONTAL = "H",
		VERTICAL = "V";

	var isTransform3d = !! config.ui.isTransform3d && support.transform3d;
	var swapview = Widget.extend( "ui.swapview", {
		container: null,
		create: function() {
			var opt = this.options;

			this.target.css( "position", "relative" ).uiSwappable();

			var isHorizontal = opt.orientation === HORIZONTAL;

			this.container = this.target.children( "ol" ).eq( 0 );

			this.$views = this.getViews();
			this.$indicator = this.getIndicator();
			this.setViewOrientation();

			this.container.css( {
				dislplay: "block",
				left: "0px",
				top: "0px"
			} ).uiDraggable( {
				keepinner: 1,
				stopPropagation: false,
				vertical: !isHorizontal,
				horizontal: isHorizontal,
				container: this.target,
				overflow: true
			} );

			this.resize();

			return this;
		},
		setViewOrientation: function() {
			if ( this.options.orientation === HORIZONTAL ) {
				this.$views.css( "float", "left" );
			} else {
				this.$views.css( "clear", "left" );
			}
		},
		getViews: function() {
			return this.container.children( "li" );
		},
		getIndicator: function() {
			var indicator = this.target.children( "ol[amdquery-widget*='ui.swapindicator']" ).eq( 0 );
			return indicator.length ? indicator.uiSwapindicator() : null;
		},
		appendIndicator: function( indicator ) {
			this.target.append( indicator );
			this.$indicator = this.getIndicator();
			this.resize();
		},
		detect: function() {
			this.$views = this.getViews();
			this.setViewOrientation();
			this.resize();
		},
		append: function( view ) {
			if ( typed.isNode( view, "li" ) ) {
				this.container.append( view );
				this.$views = this.getViews();
				this.setViewOrientation();
				if ( this.$indicator ) {
					this.$indicator.uiSwapindicator( "append", $.createEle( "li" ) );
				}
				this.resize();
			}
		},
		remove: function( removeIndex, renderIndex ) {
			var $view = this.$views.eq( removeIndex );
			if ( !$view.length ) {
				return;
			}
			$view.remove();
			if ( this.$indicator ) {
				this.$indicator.uiSwapindicator( "remove", removeIndex, renderIndex || 0 );
			}
			this.resize();
			this.render( renderIndex && renderIndex <= this.$indicator.length ? renderIndex : 0 );
		},
		resize: function() {
			var width = this.target.width();
			var height = this.target.height();
			this.width = width;
			this.height = height;

			this.orientationLength = this.options.orientation === HORIZONTAL ? this.width : this.height;

			this.$views.width( width );
			this.$views.height( height );

			if ( this.options.orientation === HORIZONTAL ) {
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

			if ( this.$indicator ) this.$indicator.uiSwapindicator( "resize" );
		},
		toPosition: function() {
			var pos = {}, opt = this.options;
			if ( opt.orientation == HORIZONTAL ) {
				pos.x = -this.target.width() * opt.index;
			} else {
				pos.y = -this.target.height() * opt.index;
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

			if ( opt.orientation === HORIZONTAL ) {
				animationOpt = $.getPositionAnimationOptionProxy( isTransform3d, -this.target.width() * index );
			} else {
				animationOpt = $.getPositionAnimationOptionProxy( isTransform3d, undefined, -this.target.height() * index );
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
				complete: function() {
					if ( self.$indicator ) self.$indicator.uiSwapindicator( "option", "index", index );
					animationEvent.type = "afterAnimation";
					self.target.trigger( animationEvent.type, animationEvent.target, animationEvent );
					if ( originIndex !== index ) {
						deactiveView.trigger( "deactive", deactiveView[ 0 ], {
							type: "deactive"
						} );
						activeView.trigger( "active", activeView[ 0 ], {
							type: "active"
						} );
					}
				}
			} );
		},
		swapPrevious: function() {
			return this.render( Math.max( 0, this.options.index - 1 ) );
		},
		swapNext: function() {
			return this.render( Math.min( this.options.index + 1, this.$views.length - 1 ) );
		},
		_setIndex: function( index ) {
			this.render( index );
		},
		enable: function() {
			var event = this.swapviewEvent;
			this.container.on( "drag.start", event );
			this.target.on( "swap.stop swap.none widget.detect", event );
			if ( this.options.detectFlexResize ) this.target.on( "flex.resize", event );
			if ( this.$indicator ) this.$indicator.on( "swapindicator.change", event );
			this.options.disabled = false;
			return this;
		},
		disable: function() {
			var event = this.swapviewEvent;
			this.container.off( "drag.start", event );
			this.target.off( "swap.stop swap.none widget.detect", event );
			if ( this.options.detectFlexResize ) this.target.on( "flex.resize", event );
			if ( this.$indicator ) this.$indicator.off( "swapindicator.change", event );
			this.options.disabled = true;
			return this;
		},
		stopAnimation: function() {
			this.container.stopAnimation( true );
			return this;
		},
		_initHandler: function() {
			var self = this,
				target = self.target,
				opt = self.options;

			this.swapviewEvent = function( e ) {
				switch ( e.type ) {
					case "widget.detect":
						self.detect();
						self.$indicator && self.$indicator.uiSwapindicator( "detect" );
						break;
					case "drag.start":
						self.stopAnimation();
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
						self.resize();
						self.toPosition();
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
					if ( opt.orientation === HORIZONTAL && status ) {
						return this.swapPrevious();
					}
					break;
				case 9:
					if ( opt.orientation === HORIZONTAL && status ) {
						return this.swapNext();
					}
					break;
				case 6:
					if ( opt.orientation === VERTICAL && status ) {
						return this.swapPrevious();
					}
					break;
				case 12:
					if ( opt.orientation === VERTICAL && status ) {
						return this.swapNext();
					}
					break;
			}

			return this.render( opt.index );
		},
		destroy: function() {
			this.target.destroyUiSwappable();
			this.container.destroyUiDraggable();
			if ( this.$swapindicator ) this.$swapindicator.destroyUiSwapindicator();
			Widget.invoke( "destroy", this );
		},
		init: function( opt, target ) {
			this._super( opt, target );
			this.width = 0;
			this.height = 0;
			this.boardWidth = 0;
			this.boardHeight = 0;
			this.orientationLength = 0;
			return this.create()._initHandler().enable().render( opt.index );
		},
		customEventName: [ "beforeAnimation", "afterAnimation" ],
		options: {
			index: 0,
			orientation: HORIZONTAL,
			animationDuration: FX.normal,
			animationEasing: "expo.easeInOut",
			detectFlexResize: true
		},
		publics: {
			render: Widget.AllowPublic,
			swapPrevious: Widget.AllowPublic,
			swapNext: Widget.AllowPublic,
			append: Widget.AllowPublic,
			remove: Widget.AllowPublic
		},
		setter: {
			orientation: Widget.initFirst,
			detectFlexResize: Widget.initFirst
		},
		getter: {

		},
		target: null,
		toString: function() {
			return "ui.swapview";
		},
		widgetEventPrefix: "swapview"
	} );
} );