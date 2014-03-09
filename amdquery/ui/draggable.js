aQuery.define( "ui/draggable", [
  "base/config",
  "base/support",
  "module/Widget",
  "main/event",
  "main/css",
  "main/position",
  "main/dom",
  "main/query",
  "animation/FX",
  "animation/animate",
  "animation/tween.extend",
  "html5/animate.transform",
  "html5/css3.transition.animate",
  "html5/css3",
  "html5/css3.position"
   ], function( $,
	config,
	support,
	Widget,
	event,
	css,
	position,
	dom,
	query,
	FX,
	animate,
	tween,
	animateTransform,
	css3Transition,
	css3,
	css3Position,
	undefined ) {
	"use strict";
	var isTransform3d = !! config.ui.isTransform3d && support.transform3d;

	var initPositionParent, getPositionX, getPositionY;
	if ( isTransform3d ) {
		initPositionParent = function() {
			this.container.initTransform3d();
			if ( this.options.container ) {
				this.positionParent = this.container;
			} else {
				this.positionParent = this.target.parent();
			}
			return this;
		};

	} else {
		initPositionParent = function() {
			var result;
			this.target.parents().each( function( ele ) {
				switch ( css.style( ele, "position" ) ) {
					case "absolute":
					case "relative":
						result = ele;
						return false;
				}
			} );
			if ( !result ) {
				result = document.body;
				css.css( result, "position", "relative" );
			}

			this.positionParent = $( result );

			return this;
		};
	}

	var eventFuns = event.document,
		draggable = Widget.extend( "ui.draggable", {
			container: null,
			create: function() {
				// var self = this;

				this.container.css( "overflow", "hidden" );

				this.target.css( "position", "absolute" );

				this._initHandler();

				this.initPositionParent();

				this._setOverflow();

				this.enable();

				return this;
			},
			customEventName: [ "start", "move", "stop", "pause", "revert" ],
			enable: function() {
				var fun = this.draggableEvent;
				this.disable();
				$( "body" ).on( "mouseup", fun );
				this.container.on( "mousemove mouseup", fun );
				this.target.on( "mousedown", fun );
				this.options.disabled = false;
				return this;
			},
			disable: function() {
				var fun = this.draggableEvent;
				$( "body" ).off( "mouseup", fun );
				this.container.off( "mousemove mouseup", fun );
				this.target.off( "mousedown", fun );
				this.options.disabled = true;
				return this;
			},
			init: function( opt, target ) {
				this._super( opt, target );
				this.container = $( this.options.container || document.body );
				return this.create().render();
			},
			initPositionParent: initPositionParent,
			_setOverflow: function( overflow ) {
				if ( overflow !== undefined ) {
					this.options.overflow = overflow;
				}
				if ( this.positionParent ) {
					if ( this.options.overflow === true || this.options.overflow === 1 ) {
						this.positionParent.css( {
							"overflow": "hidden"
						} );
					} else {
						this.positionParent.css( "overflow", "" );
					}
				}
			},
			_setContainer: function( container ) {
				if ( this.options.container === null ) {
					this.options.container = container;
				}
			},
			options: {
				container: null,
				x: 0,
				y: 0,
				originX: 0,
				originY: 0,
				diffx: 0,
				diffy: 0,
				vertical: true,
				horizontal: true,
				cursor: "default",
				overflow: false,
				keepinner: true,
				innerWidth: 0,
				innerHeight: 0,
				outerWidth: 0,
				outerHeight: 0,
				isEase: false,
				stopPropagation: true,
				pauseSensitivity: 500,
				revert: false,
				revertDuration: FX.normal,
				revertEasing: tween.expo.easeOut
			},
			setter: {
				x: 0,
				y: 0,
				originX: 0,
				originY: 0,
				diffx: 0,
				diffy: 0,
				cursor: 0
			},
			publics: {
				getPositionX: Widget.AllowReturn,
				getPositionY: Widget.AllowReturn,
				render: Widget.AllowPublic,
				animateTo: Widget.AllowPublic
			},
			getPositionX: function() {
				return this.target.getLeftWithTranslate3d();
			},
			getPositionY: function() {
				return this.target.getTopWithTranslate3d();
			},
			_initHandler: function() {
				var self = this,
					target = self.target,
					opt = self.options,
					timeout,
					parentLeft = null,
					parentTop = null,
					dragging = null;
				this.draggableEvent = function( e ) {
					var offsetLeft, offsetTop, x, y, para = {};
					if ( e.type !== "mousemove" || dragging ) {
						offsetLeft = self.getPositionX();
						offsetTop = self.getPositionY();
						x = e.pageX || e.clientX;
						y = e.pageY || e.clientY;
						para = {
							type: self.getEventName( "start" ),
							container: self.container,
							clientX: x,
							clientY: y,
							offsetX: e.offsetX || e.layerX || x - offsetLeft,
							offsetY: e.offsetY || e.layerY || y - offsetTop,
							originX: null,
							originY: null,
							event: e,
							target: this
						};
					}
					switch ( e.type ) {
						case "touchstart":
						case "mousedown":
							dragging = target;
							opt.diffx = x - offsetLeft;
							opt.diffy = y - offsetTop;
							parentLeft = self.positionParent.getLeftWithTranslate3d();
							parentTop = self.positionParent.getTopWithTranslate3d();
							para.originX = opt.originX = x - opt.diffx - parentLeft;
							para.originY = opt.originY = y - opt.diffy - parentTop;

							if ( opt.disabled ) {
								opt.cursor = "default";
							} else {
								if ( opt.vertical && opt.horizontal ) {
									opt.cursor = "move";
								} else if ( opt.horizontal ) {
									opt.cursor = "e-resize";
								} else if ( opt.vertical ) {
									opt.cursor = "n-resize";
								}
							}
							self.target.css( {
								cursor: opt.cursor
							} );

							eventFuns.preventDefault( e );
							if ( opt.stopPropagation ) {
								eventFuns.stopPropagation( e );
							}
							target.trigger( para.type, target[ 0 ], para );
							break;
						case "touchmove":
						case "mousemove":
							if ( dragging !== null ) {
								x -= ( opt.diffx + parentLeft );
								y -= ( opt.diffy + parentTop );

								self.render( x, y, parentLeft, parentTop );

								eventFuns.preventDefault( e );
								para.type = self.getEventName( "move" );
								para.offsetX = opt.x;
								para.offsetY = opt.y;
								para.originX = opt.originX;
								para.originY = opt.originY;
								target.trigger( para.type, target[ 0 ], para );

								clearTimeout( timeout );
								timeout = setTimeout( function() {
									para.type = self.getEventName( "pause" );
									target.trigger( para.type, target[ 0 ], para );
								}, opt.pauseSensitivity );
							}
							break;
						case "touchend":
						case "mouseup":
							clearTimeout( timeout );
							eventFuns.preventDefault( e );
							if ( opt.stopPropagation ) {
								eventFuns.stopPropagation( e );
							}
							para.type = self.getEventName( "stop" );
							para.offsetX = opt.x;
							para.offsetY = opt.y;
							para.originX = opt.originX;
							para.originY = opt.originY;
							dragging = null;

							self.target.css( {
								cursor: "pointer"
							} );
							target.trigger( para.type, target[ 0 ], para );

							if ( opt.revert ) {
								self.animateTo( opt.originX, opt.originY, opt.revertDuration, opt.revertEasing, function() {
									para.type = "revert";
									target.trigger( para.type, target[ 0 ], para );
								} );
							}
							break;
					}
				};

			},
			animateTo: function( x, y, duration, easing, complete ) {
				this.target.animate( $.getPositionAnimationOptionProxy( isTransform3d, x, y ), {
					duration: duration,
					easing: easing,
					complete: complete
				} );
			},
			_render: function( x, y ) {
				var pos = {}, opt = this.options;
				if ( opt.horizontal ) {
					pos.x = x;
				}
				if ( opt.vertical ) {
					pos.y = y;
				}
				this.target.setPositionXY( isTransform3d, pos );
			},
			render: function( x, y, parentLeft, parentTop ) {
				if ( !arguments.length ) {
					return;
				}
				var
				opt = this.options,
					con = this.container;

				parentLeft = parentLeft || this.positionParent.getLeftWithTranslate3d();
				parentTop = parentTop || this.positionParent.getTopWithTranslate3d();

				if ( opt.keepinner && con[ 0 ] ) {

					var pageLeft = con.getLeftWithTranslate3d() - parentLeft;
					var pageTop = con.getTopWithTranslate3d() - parentTop;

					var diffWidth = con.width() - this.target.width();
					var diffHeight = con.height() - this.target.height();

					var boundaryWidth = diffWidth > 0 ? opt.outerWidth : opt.innerWidth;
					var boundaryHeight = diffHeight > 0 ? opt.outerHeight : opt.innerHeight;

					x = $.among( pageLeft + boundaryWidth, diffWidth + pageLeft - boundaryWidth, x );
					y = $.among( pageTop + boundaryHeight, diffHeight + pageTop - boundaryHeight, y );

				}

				opt.x = x;
				opt.y = y;

				return this._render( x, y );
			},
			target: null,
			toString: function() {
				return "ui.draggable";
			},
			widgetEventPrefix: "drag"
		} );

	return draggable;

} );