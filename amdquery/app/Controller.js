aQuery.define( "app/Controller", [ "base/typed", "base/Promise", "main/query", "main/attr", "main/object", "main/CustomEvent", "app/View", "app/Model" ], function( $, typed, Promise, query, attr, object, CustomEvent, View, Model, undefined ) {
  "use strict"; //启用严格模式
  var Controller = CustomEvent.extend( "Controller", {
    init: function( id, contollerElement, view, models ) {
      this._super( );
      this.id = id;
      this.view = view;
      this.models = models || [ ];

      Controller.collection.add( this );

      var self = this;
      this.promise = new Promise(function( ) {
        var promise = this;

        var ready = function( ) {
          self.view.off( "domready", ready );
          ready = null;
          promise.resolve( );
          promise = null;
        }

        self.view.on( "domready", ready );

        self.view.replaceTo( contollerElement );

        contollerElement = null;

        return this;
      });

      // .then( function( ) {
      //   // 加载controller

      // } );


      this.promise = this.promise.then( function( ) {
        self.trigger( "ready", {
          type: "ready"
        } )
      } );

    },
    event: function( ) {

    },
    /*super*/
    _initHandler: function( ) {
      var self = this;
      this.event = function( e ) {
        switch ( e.type ) {

        }
      };
    },
    addModels: function( models ) {
      if ( !typed.isArr( models ) ) {
        models = $.util.argToArray( arguments );
      }
      this.models = this.models.concat( models );
    },
    destory: function( ) {
      //this.view.off( "domReady", this.event );

      this.promise.destoryFromRoot( );

      this.promise = null;

      Controller.collection.removeController( this );


    },
    onReady: function( ) {

    }
  }, {
    loadController: function( container, tagName ) {
      var contollerElement = query.find( tagName || "Require" ),
        self = this;

      if ( contollerElement[ 0 ] ) {
        var src = attr.getAttr( contollerElement, "src" );
        if ( ClassModule.contains( src ) ) {
          require.sync( );
        }
        return new require( src, contollerElement ).first;
      }
      return null;
    }
  } );

  var ControllerCollection = object.Collection( Controller );

  Controller.collection = new ControllerCollection;

  object.providePropertyGetSet( Controller, {
    view: "-pu -r",
    models: "-pu -r",
    id: "-pu -r"
  } );

  return Controller;
} );