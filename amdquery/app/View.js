aQuery.define( "app/View", [
  "base/config",
  "base/ClassModule",
  "base/Promise",
  "base/typed",
  "main/communicate",
  "main/query",
  "main/object",
  "main/attr",
  "main/CustomEvent",
  "main/parse",
  "module/Widget",
  "module/src"
   ], function( $,
	config,
	ClassModule,
	Promise,
	typed,
	communicate,
	query,
	object,
	attr,
	CustomEvent,
	parse,
	Widget,
	src, undefined ) {
	//View need require depend on Widget
	"use strict";
	this.describe( "Super View Class" );

	function getHtmlSrc( id ) {
		//都只能小写
		var index = id.lastIndexOf( "views/" );

		if ( index > -1 ) {
			return id.substring( 0, index ) + id.substring( index, id.length ).replace( /views\//, "xml/" );
		} else {
			throw new Error( "View need htmlSrc or path need contains views/'" );
		}

	}

	var View = CustomEvent.extend( "View", {
		init: function( contollerElement, src ) {
			this._super();
			this.topElement = this.initTopElement( src ).cloneNode( true );
			config.app.debug && $.logger( "this.topElement", this.topElement );
			attr.setAttr( this.topElement, "html-src", this.htmlSrc );
			View.collection.add( this );

			if ( typed.isNode( contollerElement, "controller" ) ) {
				this.replaceTo( contollerElement );
			} else {
				this.appendTo( contollerElement );
			}

		},
		initTopElement: function( src ) {
			src = src || ( getHtmlSrc( this.constructor._AMD.id ) + ".xml" );
			return View.getXML( src );
		},
		destroy: function() {
			View.collection.remove( this );
			self.remove();
			this.topElement = null;
		},
		appendTo: function( parent ) {
			//必须appendTo 或 replaceTo 才能触发ready
			parent.appendChild( this.topElement );
			this.initWidget();
			config.app.debug && $.logger( "View", this.constructor._AMD.id + " appendTo" );
			return this;
		},
		replaceTo: function( element ) {
			var parentNode = element.parentNode;
			parentNode.replaceChild( this.topElement, element );
			try {
				//fix ie7
				for ( var i = parentNode.childNodes.length - 1, node; i >= 0; i-- ) {
					node = parentNode.childNodes[ i ];
					if ( typed.isNode( node, "/controllers" ) ) {
						parentNode.removeChild( node );
					}
				};
			} catch ( e ) {}

			this.initWidget();

			config.app.debug && $.logger( "View", this.constructor._AMD.id + " replaceTo" );
			return this;
		},
		remove: function() {
			if ( this.topElement && this.topElement.parentNode ) {
				Widget.destroyWidgets( this.topElement.parentNode );
				$( this.topElement ).remove();
			}
			return this;
		},
		initWidget: function() {
			if ( this.topElement && this.topElement.parentNode ) {
				Widget.initWidgets( this.topElement );
			}
		},
		_getModelsElement: function() {
			//Collection
			return query.find( ">Model", this.topElement );
		},
		getModelsSrc: function() {
			return this._getModelsElement().map( function( ele ) {
				var src = attr.getAttr( ele, "src" );
				if ( !src ) {
					throw new Error( "require model:src must exist" );
				}
				return src;
			} );
		},
		_getControllerElement: function() {
			return query.find( ">Controller", this.topElement );
		},
		htmlSrc: "",
		_timeout: 5000,
		_error: function() {
			throw ( "get " + this.htmlSrc + " error" );
		}
	}, {
		getStyle: function( path ) {
			if ( config.app.autoFetchCss && config.app.development ) {
				src.link( {
					href: ClassModule.getPath( path, ".css" )
				} );
			}
		}
	} );

	var ViewCollection = object.Collection( View, {} );

	View.collection = new ViewCollection;

	object.createPropertyGetterSetter( View, {
		id: "-pu -r -w"
	} );

	if ( !config.app.development ) {
		var $combinationXML = null;

		// communicate.ajax( {
		// 	url: config.app.xmlPath,
		// 	async: false,
		// 	dataType: "string",
		// 	complete: function( xml ) {
		// 		$combinationXML = parse.HTML( xml );
		// 	},
		// 	timeout: View.timeout,
		// 	timeoutFun: View.error
		// } );

		View.getXML = function( htmlSrc ) {
			var key = "",
				xml,
				$xml;

			if ( !$combinationXML ) {
				$combinationXML = $( "#" + config.app.viewContentID );
				$combinationXML.remove();
			}

			if ( !ClassModule.contains( htmlSrc ) && /xml\/(.*)/.test( htmlSrc ) && $combinationXML && $combinationXML.length ) {
				key = RegExp.$1;
				$xml = $combinationXML.find( "div[" + config.app.viewContentID + "=" + key + "]" );
				xml = $xml.children()[ 0 ];
				define( htmlSrc, xml );
				$xml.remove();
				$xml = null;
				if ( !$combinationXML.children().length ) {
					$combinationXML = null;
				}
			}
			return require( htmlSrc ).first;
		};

	} else {
		View.getXML = function( htmlSrc ) {
			htmlSrc = ClassModule.variable( htmlSrc );
			var url = $.getPath( htmlSrc, ".xml" );
			if ( !ClassModule.contains( htmlSrc ) ) {
				var self = this;
				communicate.ajax( {
					url: url,
					async: false,
					dataType: "string",
					complete: function( xml ) {
						define( htmlSrc, parse.HTML( xml ) );
					},
					timeout: View.timeout,
					timeoutFun: View.error
				} );
			}
			return require( htmlSrc ).first;
		};
	}

	return View;
} );