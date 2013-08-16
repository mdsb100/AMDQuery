aQuery.define( "app/Controller", [ "base/ClassModule", "base/typed", "base/Promise", "main/query", "main/attr", "main/object", "main/CustomEvent", "app/View", "app/Model" ], function( $, ClassModule, typed, Promise, query, attr, object, CustomEvent, View, Model, undefined ) {
  "use strict"; //启用严格模式
  var Controller = CustomEvent.extend( "Controller", {
    init: function( id, contollerElement, View, Models ) {
      this._super( );
      this.id = id;
      this.view = new View( contollerElement );
      // 生成Models
      //this.models = Models || [ ];

      Controller.collection.add( this );

      var selfController = this;

      this.promise = new Promise( function( ) {
        var promise = this;
        selfController.view.domready( function( ) {
          promise.resolve( );
        } );
        return this;
      } ).then( function( ) {
        return Controller.loadController( selfController.view.topElement );
      } ).then( function( controllers ) {
        var self = this;

        var promise = new Promise( function( ) {
          self.resolve( );
        } );

        $.each( controllers, function( controller ) {
          // id应当为后缀
          selfController[controller.getId()] = controller;
          promise.and( function( ) {
            var self = this;
            controller.ready( function( ) {
              self.together(this);
            } );
          } );
        } );

        return this;
      } ).then( function( ) {
        selfController.onReady( );
        selfController.trigger( "ready", {
          type: "ready"
        } );

      } );

      this.promise.rootResolve( );

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
      this.promise.destoryFromRoot( );

      this.promise = null;

      Controller.collection.removeController( this );

      this.view.destory( );
    },
    ready: function( fn ) {
      // var self;
      // setTimeout( function( ) {
      this.promise.and( fn );
      // }, 0 );
      return this;
    },
    onReady: function( ) {

    }
  }, {
    loadController: function( container, tagName ) {
      var contollersElement = query.find( tagName || "Require" ),
        result = [ ]

      if ( contollersElement.length ) {
        var src, i = 0,
          len = contollersElement.length,

        for ( ; i < len; i++ ) {
          src = attr.getAttr( contollersElement[ i ], "src" );
          if ( ClassModule.contains( src ) ) {
            require.sync( );
            result.push( new require( src, contollersElement ).first );
          }
        }

      }
      return result;
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