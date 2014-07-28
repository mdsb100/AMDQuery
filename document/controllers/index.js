aQuery.define( "@app/controllers/index", [
  "main/parse",
  "module/history",
  "app/Controller",
  "@app/views/index",
  "@app/controllers/docnav",
  "@app/controllers/apinav",
  "@app/controllers/content",
  "@app/lib/map"
  ], function( $,
  parse,
  history,
  SuperController,
  IndexView,
  map ) {
  "use strict"; //启用严格模式
  var Controller = SuperController.extend( {
    init: function( contollerElement, models ) {
      this._super( new IndexView( contollerElement ), models );
      var self = this;

      this.docnav.on( "navmenu.select", function( e ) {
        self.document.loadPath( e.path );
      } );
      this.docnav.on( "navmenu.dblclick", function( e ) {
        self.document.openWindow();
      } );

      this.apinav.on( "navmenu.select", function( e ) {
        self.api.loadPath( e.path );
      } );

      this.apinav.on( "navmenu.dblclick", function() {
        self.api.openWindow();
      } );

      var loadAPIFlag = false,
        navMap = [ this.docnav, this.apinav ];
      var $swapview = $( this.view.topElement ).find( "#contentview" ).on( "swapview.change", function( e ) {

        if ( e.index === 1 && loadAPIFlag === false ) {
          loadAPIFlag = true;
          self.apinav.selectDefaultNavmenu( history.getTokenByKey( self.apinav.APINAVMENUKEY ) );
        }

        navMap[ e.index ].activate();
        navMap[ e.originIndex ].deactivate();

        history.addByKeyValue( "tab", e.index );

      } );

      var $tabview = $( "#tabview" );
      $tabview.on( "tabview.select", function( e ) {
        $swapview.uiSwapview( "render", e.index );
      } );

      history.on( 'ready', function( e ) {
        var tabIndex = this.getTokenByKey( "tab" );
        if ( parseInt( tabIndex ) === 1 ) {
          self.apinav.selectDefaultNavmenu( this.getTokenByKey( self.apinav.APINAVMENUKEY ) );
        }
        self.docnav.selectDefaultNavmenu( this.getTokenByKey( self.docnav.DOCNAVMENUKEY ) );

        $tabview.uiTabview( 'render', parseInt( tabIndex ) || 0 );
      } ).on( 'tab.change', function( e ) {
        $tabview.uiTabview( 'render', parseInt( e.token ) || 0 );
      } );

      history.init();
    },
    destroy: function() {
      $( this.view.topElement ).find( "#contentview" ).clearHandlers();
      this.docnav.clearHandlers();
      this.apinav.clearHandlers();
      SuperController.invoke( "destroy" );
    }
  }, {

  } );

  return Controller;
} );