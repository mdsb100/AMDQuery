aQuery.define( "ui/scrollableview", [
  "base/config",
  "base/client",
  "base/support",
  "base/typed",
  "main/query",
  "main/css",
  "main/event",
  "main/position",
  "main/dom",
  "main/class",
  "html5/css3",
  "html5/animate.transform",
  "html5/css3.transition.animate",
  "module/Widget",
  "animation/FX",
  "animation/animate",
  "animation/tween.extend",
  "module/Keyboard",
  "ui/swappable",
  "ui/draggable",
  "ui/keyboard" ], function( $,
	config,
	client,
	support,
	typed,
	query,
	css,
	event,
	position,
	dom,
	cls,
	css3,
	animateTransform,
	css3Transition,
	Widget,
	FX,
	animate,
	tween,
	Keyboard,
	swappable,
	draggable,
	keyboard, undefined ) {
	"use strict";
	Widget.fetchCSS( "ui/css/scrollableview" );
	var isTransform3d = !! config.ui.isTransform3d && support.transform3d;

	var V = "V",
		H = "H";

	var scrollableview = Widget.extend( "ui.scrollableview", {
		container: null,
		_keyList: [ "Up", "Down", "Left", "Right", "Home", "End", "PageUp", "PageDown" ],
		_combintionKeyList: [ "Up", "Right", "Down", "Left" ],
		create: function() {
			var opt = this.options;
			this.positionParent = $( {
				"overflow": "visible"
			}, "div" ).width( this.target.width() ).height( this.target.height() ).append( this.target.children() );

			this.container = $( {
				"position": "absolute"
			}, "div" ).append( this.positionParent ).appendTo( this.target );

			this.target.uiSwappable();

			this.target.find( "a[float=false]" ).css( {
				position: "absolute",
				zIndex: 1000
			} ).appendTo( this.target );

			this.statusBarX = $( {
				height: "10px",
				display: "none",
				position: "absolute",
				bottom: "0px"
			}, "div" ).addClass( "aquery-scrollableViewStatusBar" ).appendTo( this.target );

			this.statusBarY = $( {
				width: "10px",
				display: "none",
				position: "absolute",
				right: "0px"
			}, "div" ).addClass( "aquery-scrollableViewStatusBar" ).appendTo( this.target );

			if ( opt.enableKeyboard ) {
				this.target.uiKeyboard();
			}

			this.container.uiDraggable( {
				keepinner: 1,
				innerWidth: opt.boundary,
				innerHeight: opt.boundary,
				stopPropagation: false,
				vertical: this._isAllowedDirection( V ),
				horizontal: this._isAllowedDirection( H ),
				container: this.target,
				overflow: true
			} );

			this.detect();

			if ( isTransform3d ) this.container.initTransform3d();

			return this;
		},
		enable: function() {
			var event = this.scrollableviewEvent,
				opt = this.options;
			this.container.on( "DomNodeInserted DomNodeRemoved drag.pause drag.move drag.start", event );
			this.container.uiDraggable( "enable" );
			this.target.on( "swap.move swap.stop swap.pause widget.detect", event ).touchwheel( event );
			this.target.uiSwappable( "enable" );
			this.target.delegate( "a[href^=#]", "click", event );

			if ( opt.enableKeyboard ) {
				this.target.uiKeyboard( "addKey", {
					type: "keyup",
					keyCode: this._combintionKeyList,
					combinationKey: opt.combinationKey.split( /;|,/ ),
					todo: event
				} ).uiKeyboard( "addKey", {
					type: "keydown",
					keyCode: this._keyList,
					todo: event
				} );
				this.target.uiKeyboard( "enable" );
			}

			opt.disabled = false;
			return this;
		},
		disable: function() {
			var event = this.scrollableviewEvent,
				opt = this.options;
			this.container.off( "DomNodeInserted DomNodeRemoved drag.pause drag.move drag.start", event );
			this.container.uiDraggable( "disable" );
			this.target.off( "swap.move swap.stop swap.pause widget.detect", event ).off( "touchwheel", event );
			this.target.uiSwappable( "disable" );
			this.target.off( "click", event );

			if ( opt.enableKeyboard ) {
				this.target.uiKeyboard( "removeKey", {
					type: "keyup",
					keyCode: this._combintionKeyList,
					combinationKey: opt.combinationKey.split( /;|,/ ),
					todo: event
				} ).uiKeyboard( "removedKey", {
					type: "keydown",
					keyCode: this._keyList,
					todo: event
				} );
				this.target.uiKeyboard( "disable" );
			}

			opt.disabled = true;
			return this;
		},
		_initHandler: function() {
			var self = this,
				target = self.target,
				opt = self.options,
				check = function() {
					self.toHBoundary( self.getLeft() ).toVBoundary( self.getTop() ).hideStatusBar();
				},
				keyToMove = function( x, y ) {
					clearTimeout( self.keyTimeId );
					self.keyTimeId = setTimeout( check, 500 );
					self.render( x, y, true, 0 );
					self.showStatusBar();
				},
				keyToAnimate = function( name, value, statusBar ) {
					self.showStatusBar();
					self.container.stopAnimation( true );
					statusBar.stopAnimation( true );
					self[ name ]( value, FX.normal );
				};

			var
			combinationKeyItem = {
				type: "keyup",
				keyCode: "Up",
				combinationKey: opt.combinationKey.split( /;|,/ )
			},
				KeyItem = {
					type: "keydown",
					keyCode: "Up"
				},
				i,
				keyType = {};

			for ( i = this._combintionKeyList.length - 1; i >= 0; i-- ) {
				combinationKeyItem.keyCode = this._combintionKeyList[ i ];
				keyType[ "Combination" + combinationKeyItem.keyCode ] = Keyboard.getHandlerName( combinationKeyItem );
			}

			for ( i = this._keyList.length - 1; i >= 0; i-- ) {
				KeyItem.keyCode = this._keyList[ i ];
				keyType[ KeyItem.keyCode ] = Keyboard.getHandlerName( KeyItem );
			}

			this.scrollableviewEvent = function( e ) {
				switch ( e.type ) {
					case Widget.detectEventName:
						self.detect();
						break;
					case "drag.move":
						var x = self.checkXBoundary( e.offsetX, opt.boundary ),
							y = self.checkYBoundary( e.offsetY, opt.boundary );
						self.renderStatusBar( self.checkXStatusBar( x ), self.checkYStatusBar( y ) );
						self.showStatusBar();
						break;
					case "drag.pause":
						var left = self.getLeft(),
							top = self.getTop(),
							distance = opt.pullDistance;

						if ( left > distance ) {
							e.type = self.getEventName( "pullleft" );
							target.trigger( e.type, this, e );
						} else if ( left < -self.overflowWidth - distance ) {
							e.type = self.getEventName( "pullright" );
							target.trigger( e.type, this, e );
						}
						if ( top > distance ) {
							e.type = self.getEventName( "pulldown" );
							target.trigger( e.type, this, e );
						} else if ( top < -self.overflowHeight - distance ) {
							e.type = self.getEventName( "pullup" );
							target.trigger( e.type, this, e );
						}

						break;
					case "drag.start":
						if ( opt.enableKeyboard ) target[ 0 ].focus();
						self.stopAnimation();
						self.detect();
						break;
					case "DomNodeInserted":
					case "DomNodeRemoved":
						self.detect().toVBoundary( self.getTop() ).toHBoundary( self.getLeft() );
						break;
					case "swap.move":
						self.showStatusBar();
						break;
					case "swap.stop":
						self.animate( e );
						break;
					case "swap.pause":
						self.pause( e );
						break;
					case "mousewheel":
					case "DOMMouseScroll":
						x = null;
						y = null;
						clearTimeout( self.wheelTimeId );
						self.layout();
						// var x = null,
						// y = null;
						if ( e.direction == "x" ) {
							x = e.delta * opt.mouseWheelAccuracy;
						} else if ( e.direction == "y" ) {
							y = e.delta * opt.mouseWheelAccuracy;
						}
						self.showStatusBar();

						self.wheelTimeId = setTimeout( check, 500 );

						self.render( x, y, true, opt.boundary );
						break;
					case "click":
						event.document.preventDefault( e );
						event.document.stopPropagation( e );

						self.layout();

						var $a = $( this ),
							href = ( $a.attr( "href" ) || "" ).replace( window.location.href, "" ).replace( "#", "" );
						self.animateToElement( self.getAnimationToElementByName( href ) );
						break;

					case keyType.CombinationLeft:
						keyToAnimate( "animateX", 0, self.statusBarX );
						break;
					case keyType.CombinationUp:
						keyToAnimate( "animateY", 0, self.statusBarY );
						break;
					case keyType.CombinationRight:
						keyToAnimate( "animateX", -self.scrollWidth + self.viewportWidth, self.statusBarX );
						break;
					case keyType.CombinationDown:
						keyToAnimate( "animateY", -self.scrollHeight + self.viewportHeight, self.statusBarY );
						break;
					case keyType.Up:
						keyToMove( 0, opt.keyVerticalDistance );
						break;
					case keyType.Down:
						keyToMove( 0, -opt.keyVerticalDistance );
						break;
					case keyType.Left:
						keyToMove( opt.keyHorizontalDistance, 0 );
						break;
					case keyType.Right:
						keyToMove( -opt.keyHorizontalDistance, 0 );
						break;
					case keyType.PageUp:
						keyToAnimate( "animateY", Math.min( opt.boundary, self.getTop() + self.viewportHeight ), self.statusBarY );
						break;
					case keyType.PageDown:
						keyToAnimate( "animateY", Math.max( -self.scrollHeight + self.viewportHeight - opt.boundary, self.getTop() - self.viewportHeight ), self.statusBarY );
						break;
					case keyType.Home:
						keyToAnimate( "animateY", 0, self.statusBarY );
						break;
					case keyType.End:
						keyToAnimate( "animateY", -self.scrollHeight + self.viewportHeight, self.statusBarY );
						break;
				}
			};
			return this;
		},
		getAnimationToElementByName: function( name ) {
			return this.target.find( "[name=" + ( name || "__undefined" ) + "]" );
		},
		animateToElement: function( ele, animationCallback ) {
			var $toElement = $( ele );
			if ( $toElement.length === 1 && query.contains( this.target[ 0 ], $toElement[ 0 ] ) ) {
				var top = $toElement.getTopWithTranslate3d(),
					left = $toElement.getLeftWithTranslate3d(),
					self = this,
					callback = function( overflow ) {
						animationCallback && animationCallback.apply( this, arguments );
						var type = self.getEventName( "animateToElement" );
						self.target.trigger( type, self.target[ 0 ], {
							type: type,
							toElement: typed.is$( ele ) ? ele[ 0 ] : ele,
							overflow: overflow
						} );
					};
				if ( this._isAllowedDirection( V ) ) {
					this.animateY( Math.max( -top + this.viewportHeight > 0 ? 0 : -top, -this.scrollHeight + this.viewportHeight ), FX.normal, callback );
				}
				if ( this._isAllowedDirection( H ) ) {
					this.animateX( Math.max( -left + this.viewportHeight > 0 ? 0 : -left, -this.scrollWidth + this.viewportWidth ), FX.normal, callback );
				}
			}
		},
		destroy: function() {
			this.target.destroyUiSwappable();
			this.container.destroyUiDraggable();
			this.target.children().remove();
			this.positionParent.children().appendTo( this.target );
			Widget.invoke( "destroy", this );
		},
		init: function( opt, target ) {
			this._super( opt, target );

			this._direction = null;

			this.wheelTimeId = null;

			this.keyTimeId = null;

			this.originOverflow = this.target.css( "overflow" );

			// this.target.attr( "amdquery-ui", "scrollableview" );
			this.target.css( {
				"overflow": "hidden",
				/*fix ie*/
				"overflow-x": "hidden",
				"overflow-y": "hidden"
			} );

			var pos = this.target.css( "position" );
			if ( pos != "relative" && pos != "absolute" ) {
				this.target.css( "position", "relative" );
			}

			var self = this;

			if ( this.options.firstToElement ) {
				setTimeout( function() {
					self.animateToElement( self.options.firstToElement );
				}, 0 );
			}

			this.create()._initHandler().enable().render( 0, 0 );

			if ( this.options.focus ) {

				setTimeout( function() {
					try {
						self.layout();
						self.target[ 0 ].focus();
					} catch ( e ) {}
				}, 0 );

			}

			return this;
		},
		customEventName: [ "pulldown", "pullup", "pullleft", "pullright", "animationEnd", "animateToElement" ],
		options: {
			"overflow": "HV",
			"animateDuration": 600,
			"boundary": 150,
			"boundaryDruation": 300,
			"mouseWheelAccuracy": 0.3,
			"pullDistance": 50,
			"enableKeyboard": false,
			"combinationKey": client.system.mac ? "cmd" : "ctrl",
			"firstToElement": "",
			"keyVerticalDistance": 40,
			"keyHorizontalDistance": 40,
			"focus": false
		},
		setter: {
			"enableKeyboard": Widget.initFirst,
			"combinationKey": Widget.initFirst,
			"firstToElement": Widget.initFirst
		},
		publics: {
			"showStatusBar": Widget.AllowPublic,
			"hideStatusBar": Widget.AllowPublic,
			"render": Widget.AllowPublic,
			"getAnimationToElementByName": Widget.AllowReturn,
			"animateToElement": Widget.AllowPublic,
			"toH": Widget.AllowPublic,
			"toV": Widget.AllowPublic,
			"append": Widget.AllowPublic,
			"remove": Widget.AllowPublic,
			"replace": Widget.AllowPublic
		},
		render: function( x, y, addtion, boundary ) {
			if ( !arguments.length ) {
				return;
			}
			var position,
				originX = 0,
				originY = 0,
				statusX, statusY;

			boundary = boundary == null ? this.options.boundary : boundary;

			if ( addtion ) {
				position = this.getContainerPosition();

				originX = position.x;
				originY = position.y;
			}

			if ( x !== null && this._isAllowedDirection( H ) ) {
				x = this.checkXBoundary( originX + x, boundary );
				statusX = this.checkXStatusBar( x );
			}
			if ( y !== null && this._isAllowedDirection( V ) ) {
				y = this.checkYBoundary( originY + y, boundary );
				statusY = this.checkYStatusBar( y );
			}

			return this._render( x, statusX, y, statusY );
		},
		_render: function( x1, x2, y1, y2 ) {
			var pos = {};
			if ( x1 !== null && this._isAllowedDirection( H ) ) {
				pos.x = parseInt( x1, 0 );
				this.statusBarX.setPositionX( isTransform3d, parseInt( x2, 0 ) );
			}
			if ( y1 !== null && this._isAllowedDirection( V ) ) {
				pos.y = parseInt( y1, 0 );
				this.statusBarY.setPositionY( isTransform3d, parseInt( y2, 0 ) );
			}
			this.container.setPositionXY( isTransform3d, pos );
			return this;
		},
		renderStatusBar: function( x, y ) {
			if ( this._isAllowedDirection( H ) ) this.statusBarX.setPositionX( isTransform3d, parseInt( x, 0 ) );

			if ( this._isAllowedDirection( V ) ) this.statusBarY.setPositionY( isTransform3d, parseInt( y, 0 ) );

			return this;
		},
		getContainerPosition: function() {
			return {
				x: this.getLeft(),
				y: this.getTop()
			};
		},

		target: null,
		toString: function() {
			return "ui.scrollableview";
		},
		widgetEventPrefix: "scrollableview",

		append: function( content ) {
			this.positionParent.append( content );
			this.detect();
		},

		remove: function( content ) {
			// must ele
			if ( query.contains( this.positionParent[ 0 ], content ) ) {
				$( content ).remove();
				this.detect();
			}
		},

		detect: function() {
			this.layout().resize();
			return this;
		},

		replace: function( ele1, ele2 ) {
			// must ele
			if ( query.contains( this.positionParent[ 0 ], ele1 ) ) {
				$( ele1 ).replaceWith( ele2 );
				this.detect();
			}
		},

		refreshStatusBar: function() {
			var viewportWidth = this.viewportWidth,
				scrollWidth = this.scrollWidth,
				viewportHeight = this.viewportHeight,
				scrollHeight = this.scrollHeight,
				width = 0,
				height = 0;

			if ( scrollWidth != viewportWidth ) {
				this.statusBarXVisible = 1;
				width = viewportWidth * viewportWidth / scrollWidth;
			} else {
				width = this.statusBarXVisible = 0;
			}


			if ( scrollHeight != viewportHeight ) {
				this.statusBarYVisible = 1;
				height = viewportHeight * viewportHeight / scrollHeight;
			} else {
				height = this.statusBarYVisible = 0;
			}

			this.statusBarX.width( width );
			this.statusBarY.height( height );

			return this;
		},
		resize: function() {
			this.container.width( this.scrollWidth );
			this.container.height( this.scrollHeight );
			return this;
		},
		layout: function() {
			// add Math.max to fix ie7
			var originViewportHeight = this.viewportHeight,
				originViewportWidth = this.viewportWidth;

			this.viewportWidth = this.target.width();
			this.viewportHeight = this.target.height();

			if ( originViewportWidth !== this.originViewportWidth ) {
				this.positionParent.width( this.viewportWidth );
			}

			if ( originViewportHeight !== this.viewportHeight ) {
				this.positionParent.height( this.viewportHeight );
			}

			this.scrollWidth = client.browser.ie678 ? Math.max( this.positionParent.scrollWidth(), this.container.scrollWidth() ) : this.positionParent.scrollWidth();
			this.scrollHeight = client.browser.ie678 ? Math.max( this.positionParent.scrollHeight(), this.container.scrollHeight() ) : this.positionParent.scrollHeight();

			this.overflowWidth = this.scrollWidth - this.viewportWidth;
			this.overflowHeight = this.scrollHeight - this.viewportHeight;

			return this.refreshStatusBar();
		},
		_isAllowedDirection: function( direction ) {
			return this.options.overflow.indexOf( direction ) > -1;
		},
		getTop: function() {
			return this.container.getPositionY();
		},
		getLeft: function() {
			return this.container.getPositionX();
		},
		pause: function() {

			return this;
		},
		stopAnimation: function() {
			this.container.stopAnimation( true );
			this.statusBarX.stopAnimation( true );
			this.statusBarY.stopAnimation( true );
			this.toVBoundary( this.getTop() ).toHBoundary( this.getLeft() );
		},
		animate: function( e ) {
			var opt = this.options,
				a0 = e.acceleration,
				t0 = opt.animateDuration - e.duration,
				s0 = Math.round( a0 * t0 * t0 * 0.5 );
			this._direction = e.direction;

			if ( t0 <= 0 ) {
				this.toVBoundary( this.getTop() ).toHBoundary( this.getLeft() );
				return this.hideStatusBar();
			}

			switch ( e.direction ) {
				case 3:
					this.toH( -s0, t0 );
					break;
				case 9:
					this.toH( s0, t0 );
					break;
				case 6:
					this.toV( -s0, t0 );
					break;
				case 12:
					this.toV( s0, t0 );
					break;
				default:
					this.toHBoundary( this.getTop() ).toVBoundary( this.getLeft() );
			}

			return this;
		},

		checkXBoundary: function( s, boundary ) {
			boundary = boundary !== undefined ? boundary : this.options.boundary;
			return $.between( -( this.overflowWidth + boundary ), boundary, s );
		},
		checkYBoundary: function( s, boundary ) {
			boundary = boundary !== undefined ? boundary : this.options.boundary;
			return $.between( -( this.overflowHeight + boundary ), boundary, s );
		},

		checkXStatusBar: function( left ) {
			var result = -left / this.scrollWidth * this.viewportWidth;
			return $.between( 0, this.viewportWidth - this.statusBarX.width(), result );
		},

		checkYStatusBar: function( top ) {
			var result = -top / this.scrollHeight * this.viewportHeight;
			return $.between( 0, this.viewportHeight - this.statusBarY.height(), result );
		},

		showStatusBar: function() {
			if ( this.statusBarXVisible && this._isAllowedDirection( H ) ) this.statusBarX.show();
			if ( this.statusBarYVisible && this._isAllowedDirection( V ) ) this.statusBarY.show();
			return this;
		},
		hideStatusBar: function() {
			this.statusBarX.hide();
			this.statusBarY.hide();
			return this;
		},

		outerXBoundary: function( t ) {
			if ( t > 0 ) {
				return 0;
			} else if ( t < -this.overflowWidth ) {
				return -this.overflowWidth;
			}
			return null;
		},

		outerYBoundary: function( t ) {
			if ( t > 0 ) {
				return 0;
			} else if ( t < -this.overflowHeight ) {
				return -this.overflowHeight;
			}
			return null;
		},

		_triggerAnimate: function( scene, direction, duration, distance ) {
			var type = this.getEventName( "animationEnd" );
			this.target.trigger( type, this.container[ 0 ], {
				type: type,
				scene: scene,
				direction: direction,
				duration: duration,
				distance: distance
			} );
		},

		toHBoundary: function( left ) {
			var outer = this.outerXBoundary( left ),
				self = this;

			if ( outer !== null ) {
				this.container.animate( $.getPositionAnimationOptionProxy( isTransform3d, outer ), {
					duration: this.options.boundaryDruation,
					easing: "expo.easeOut",
					queue: false,
					complete: function() {
						self.hideStatusBar();
						self._triggerAnimate( "boundary", self._direction, self.options.boundaryDruation, outer );
					}
				} );
			} else {
				this.statusBarX.hide();
			}
			return this;
		},

		toVBoundary: function( top ) {
			var outer = this.outerYBoundary( top ),
				self = this;
			if ( outer !== null ) {
				this.container.animate( $.getPositionAnimationOptionProxy( isTransform3d, undefined, outer ), {
					duration: this.options.boundaryDruation,
					easing: "expo.easeOut",
					queue: false,
					complete: function() {
						self.hideStatusBar();
						self._triggerAnimate( "boundary", self._direction, self.options.boundaryDruation, outer );
					}
				} );
			} else {
				this.statusBarY.hide();
			}
			return this;
		},

		toH: function( s, t, d, animationCallback ) {
			return this._isAllowedDirection( H ) ? this.animateX( this.checkXBoundary( this.getLeft() - s ), t, d, animationCallback ) : this;
		},
		toV: function( s, t, d, animationCallback ) {
			return this._isAllowedDirection( V ) ? this.animateY( this.checkYBoundary( this.getTop() - s ), t, d, animationCallback ) : this;
		},
		animateY: function( y1, t, animationCallback ) {
			var opt = $.getPositionAnimationOptionProxy( isTransform3d, undefined, y1 );
			var self = this,
				y2 = this.checkYStatusBar( parseFloat( opt.top ) );

			this.container.animate( opt, {
				duration: t,
				easing: "easeOut",
				complete: function() {
					self.toHBoundary( self.getLeft() ).toVBoundary( y1 );
					self._triggerAnimate( "inner", self._direction, t, y1 );
					if ( typed.isFun( animationCallback ) ) animationCallback.call( self.target, V );
				}
			} );

			this.statusBarY.animate( $.getPositionAnimationOptionProxy( isTransform3d, undefined, y2 ), {
				duration: t,
				easing: "easeOut"
			} );
			return this;
		},
		animateX: function( x1, t, animationCallback ) {
			var opt = $.getPositionAnimationOptionProxy( isTransform3d, x1 );
			//也有可能要移动之后
			var self = this,
				x2 = this.checkXStatusBar( parseFloat( opt.left ) );

			this.container.animate( opt, {
				duration: t,
				easing: "easeOut",
				complete: function() {
					self.toHBoundary( x1 ).toVBoundary( self.getTop() );
					self._triggerAnimate( "inner", self._direction, t, x1 );
					if ( typed.isFun( animationCallback ) ) animationCallback.call( self.target, H );
				}
			} );

			this.statusBarX.animate( $.getPositionAnimationOptionProxy( isTransform3d, x2 ), {
				duration: t,
				easing: "easeOut"
			} );
			return this;
		}
	} );

	return scrollableview;
} );