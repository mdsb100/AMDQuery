define( "module/history", [ "base/constant", "base/client", "base/support", "base/typed", "base/extend", "main/query", "main/dom", "main/CustomEvent", "main/parse", "module/Thread" ], function( constant, client, support, typed, utilExtend, query, dom, CustomEvent, parse, Thread ) {
  "use strict";
  var
    ie = client.browser.ie,
    oldIEMode = ie === 7 || !support.boxModel && ie === 8;

  /**
   * @exports module/history
   * @requires module:main/constant
   * @requires module:base/client
   * @requires module:base/support
   * @requires module:base/typed
   * @requires module:main/query
   * @requires module:main/dom
   * @requires module:main/parse
   * @requires module:main/CustomEvent
   * @requires module:module/Thread
   * @mixes module:main/CustomEvent.prototype
   */
  var history = {
    init: function() {
      this.ready = false;
      this.currentToken = null;
      this.useTopWindow = true;
      this.hiddenField = dom.parseHTML(
        '<form id="history-form" style="display:none!important;" >' +
        '<input type="hidden" id="x-history-field" />' +
        '<iframe id="x-history-frame"></iframe>' +
        '</form>'
      )[ 0 ];

      document.body.appendChild( this.hiddenField );

      if ( oldIEMode ) {
        this.iframe = dom.parseHTML(
          '<iframe role="presentation" src="' + constant.SSL_SECURE_URL + '"  >' + '</iframe>'
        )[ 0 ];
        document.body.appendChild( this.iframe );
      }
      this.startUp();
    },
    /**
     * @private
     */
    startUp: function() {
      var hash;

      this.currentToken = this.hiddenField.value || this.getHash();

      if ( oldIEMode ) {
        this.checkIFrame();
      } else {
        hash = this.getHash();
        new Thread( {
          interval: 50,
          run: function() {
            var newHash = this.getHash();
            if ( newHash !== hash ) {
              var oldHash = hash;
              hash = newHash;
              this.handleStateChange( newHash, oldHash );
              this.doSave();
            }
          },
          context: this
        } ).start();
        this.handleReady( this.getHash() );
      }
      return this;
    },
    /**
     * @private
     */
    checkIFrame: function() {
      var
        contentWindow = this.iframe.contentWindow,
        doc, elem, oldToken, oldHash;

      if ( !contentWindow || !contentWindow.document ) {
        var self = this;
        setTimeout( function() {
          self.checkIFrame();
        }, 10 );
        return;
      }

      doc = contentWindow.document;
      elem = doc.getElementById( "state" );
      oldToken = elem ? elem.token : null;
      oldHash = this.getHash();

      new Thread( {
        run: function() {
          var doc = contentWindow.document,
            elem = doc.getElementById( "state" ),
            newToken = elem ? elem.token : null,
            newHash = this.getHash();

          if ( newToken !== oldToken ) {
            var token = oldToken;
            oldToken = newToken;
            this.handleStateChange( newToken, token );
            this.setHash( newToken );
            oldHash = newToken;
            this.doSave();
          } else if ( newHash !== oldHash ) {
            oldHash = newHash;
            this.updateIFrame( newHash );
          }
        },
        interval: 50,
        context: this
      } ).start();

      this.handleReady( this.getHash() );
    },
    /**
     * @private
     */
    updateIFrame: function( token ) {
      var html = '<html><body><div id="state" role="presentation">' +
        token + '</div></body></html>',
        doc;

      try {
        doc = this.iframe.contentWindow.document;
        doc.open();
        doc.write( html );
        var elem = doc.getElementById( "state" );
        elem.token = token;
        doc.close();
        return true;
      } catch ( e ) {
        return false;
      }
    },
    /**
     * @private
     */
    doSave: function() {
      this.hiddenField.value = this.currentToken;
    },
    /**
     * @private
     */
    handleStateChange: function( newToken, oldToken ) {
      this.currentToken = newToken;

      var newObject = parse.QueryString( newToken ),
        oldObject = parse.QueryString( oldToken );

      this.doTrigger( 'change', newToken, oldToken );
    },
    /**
     * @private
     */
    handleReady: function( token ) {
      this.ready = true;
      this.trigger( CustomEvent.createEvent( 'ready', this, {
        token: token
      } ) );
    },
    /**
     * @private
     */
    doTrigger: function( type, newToken, oldToken ) {
      var newObject = parse.QueryString( newToken ),
        oldObject = parse.QueryString( oldToken ),
        key, evenName;

      for ( key in newObject ) {
        if ( oldObject[ key ] === undefined || oldObject[ key ] !== newObject[ key ] ) {
          evenName = key + '.' + type;
          this.trigger( CustomEvent.createEvent( evenName, this, {
            token: newObject[ key ]
          } ) );
        }
      }
      for ( key in oldObject ) {
        if ( newObject[ key ] === undefined ) {
          evenName = key + '.' + type;
          this.trigger( CustomEvent.createEvent( evenName, this, {
            token: ''
          } ) );
        }
      }
      this.trigger( CustomEvent.createEvent( type, this, {
        token: newToken
      } ) );
    },
    /**
     * @private
     */
    getHash: function() {
      var win = this.useTopWindow ? window.top : window,
        href = win.location.href,
        i = href.indexOf( "#" );

      return i >= 0 ? href.substr( i + 1 ) : null;
    },
    /**
     * @private
     */
    setHash: function( hash ) {
      var win = this.useTopWindow ? window.top : window;
      try {
        win.location.hash = hash;
      } catch ( e ) {
        // IE can give Access Denied (esp. in popup windows)
      }
    },
    /**
     * Add a new token to the history stack. This can be any arbitrary value, although it would
     * commonly be the concatenation of a component id and another id marking the specific history
     * @param {String} token The value that defines a particular application-specific history state
     * @param {Boolean} [preventDuplicates=true] When true, if the passed token matches the current token
     * it will not save a new history step. Set to false if the same state can be saved more than once
     * at the same history stack location.
     */
    add: function( token, preventDup ) {
      if ( preventDup !== false ) {
        if ( this.getToken() === token ) {
          return true;
        }
      }

      if ( oldIEMode ) {
        return this.updateIFrame( token );
      } else {
        this.setHash( token );
        return true;
      }
    },
    /**
     * Add key-value to the history stack. This can be any arbitrary value, although it would
     * commonly be the concatenation of a component id and another id marking the specific history
     * @param {String} token The value that defines a key
     * @param {String} token The value that defines a value
     * @param {Boolean} [preventDuplicates=true] When true, if the passed token matches the current token
     * it will not save a new history step. Set to false if the same state can be saved more than once
     * at the same history stack location.
     */
    addByKeyValue: function( key, value, preventDup ) {
      var object = parse.QueryString( this.getToken() );
      if ( typed.isObject( key ) ) {
        utilExtend.easyExtend( object, key );
      } else {
        object[ key ] = value;
      }

      return this.add( parse.ObjetToString( object ), preventDup );
    },

    /**
     * Programmatically steps back one step in browser history (equivalent to the user pressing the Back button).
     */
    back: function() {
      window.history.go( -1 );
    },

    /**
     * Programmatically steps forward one step in browser history (equivalent to the user pressing the Forward button).
     */
    forward: function() {
      window.history.go( 1 );
    },

    /**
     * Retrieves the currently-active history token.
     * @return {String} The token
     */
    getToken: function() {
      return this.ready ? this.currentToken : this.getHash();
    },
    /**
     * Retrieves the currently-active history by key.
     * @return {String} The value
     */
    getTokenByKey: function( key ) {
      return parse.QueryString( this.ready ? this.currentToken : this.getHash() )[ key ] || "";
    }
  };

  CustomEvent.mixin( history );

  return history;

} );