/// <reference path="amdquery.js" />
define( "my/common/phonegap.plugin", [ "my/common/tools" ], function( tools ) {
  "use strict"; //启用严格模式
  //$.error(true);
  //window.debugInfo = [];

  var $ = tools,
  phonegap = {
    addEventListener: function( name, fun ) {
      document.addEventListener( name, fun, false );
      return this;
    },
    alert: function( str, callback, title, button ) {
      if ( navigator.notification && navigator.notification.alert ) {
        navigator.notification.alert( str, callback, title, button );
      } else {
        alert( str );
        callback && callback( );
      }
    },
    confirm: function( str, callback, title, button ) {
      if ( navigator.notification && navigator.notification.confirm ) {
        navigator.notification.confirm( str, function( e ) {
          callback( e == 1 ? true : false );
        }, title, button );
      } else {
        var ret = confirm( str );
        callback && callback( ret );
        return ret;
      }
    },
    //        , log: function (value, key) {
    //            key = key || "anonymous";
    //            var msg = key + ":" + value;
    //            window.debugInfo[window.debugInfo.length] = msg;
    //            console.log(msg);
    //        }

    deviceReady: function( fun, already ) {
      /// <summary>实现phonegap的deviceready
      /// </summary>
      /// <param name="fun" type="Function">方法</param>
      /// <returns type="self" />
      // window.addEventListener("load", function () {
      document.addEventListener( "deviceready", fun, false );
      //}, false);
      return this;
    },
    preventBehavior: function( ) {
      /// <summary>屏蔽dom的滚动
      /// </summary>
      /// <returns type="self" />
      //$.event.document.addHandler(document, "touchmove", preventBehavior);
      document.body.addEventListener( "touchmove", function( e ) {
        //$.showMsg("move", true);
        $.event.document.preventDefault( e );
      }, false );
      return this;
    },
    preventOrientationchange: function( ) {
      /// <summary>屏蔽屏幕方向改变
      /// </summary>
      /// <returns type="self" />
      window.addEventListener( "orientationchange", function( e ) {
        $.event.document.preventDefault( e );
        return false;
      }, false );
      return this;
    },
    file: {
      defaultFullPath: "",

      defaultFileSystem: null,

      _getRoot: function( fileSystem ) {
        var result;
        if ( fileSystem ) {
          result = fileSystem.root || fileSystem;
        } else {
          result = this.defaultFileSystem.root;
        }


        return result;
      },
      appendFile: function( name, content, option, fileSystem ) {
        var entry = this._getRoot( fileSystem ),
          opt = $.extend( {}, this.fileSettings, option );

        entry.getFile( name, opt.flags, function( fileEntry ) {
          fileEntry.createWriter( function( writer ) {
            writer.onwriteend = opt.onEvent;
            writer.seek( opt.length || writer.length );
            writer.write( content );

          }, this.fileFail );
        }, this.fileFail );

        return this;
      },
      copyTo: function( entry, directory, fun, newName ) {
        entry.copyTo( directory, newName || entry.name, fun, this.fileFail );
        return this;
      },
      moveTo: function( entry, directory, fun, newName ) {
        entry.moveTo( directory, newName || entry.name, fun, this.fileFail );
        return this;
      },
      fileFail: function( e ) {
        var s = "";
        //$.each(e, function (item, name) {
        //s += name + ":" + item + "</br>";
        //$.phonegap.alert(name + ":" + item)
        //});
        s = $.phonegap.file.fileError[ e.code + "" ];
        $.showMsg( s || e, true );
        return this;
      },
      transferFail: function( e ) {
        var s = "";
        s = $.phonegap.file.fileTransferError[ e.code + "" ];
        $.showMsg( s || e, true );
        return this;
      },
      getDirectory: function( name, option, fileSystem ) {
        var entry = this._getRoot( fileSystem ),
          opt = $.extend( {}, this.fileSettings, option );
        entry.getDirectory( name, opt.flags, opt.onEvent, this.fileFail );
        return this;
      },
      remove: function( fun, entry ) {
        entry.remove( fun, this.fileFail );
        return this;
      },
      removeRecursively: function( fun, entry ) {
        entry.removeRecursively( fun, this.fileFail );
        return this;
      },
      getFile: function( name, option, fileSystem ) {
        var entry = this._getRoot( fileSystem ),
          opt = $.extend( {}, this.fileSettings, option );
        entry.getFile( name, opt.flags, opt.onEvent, this.fileFail );

        return this;
      },
      getAll: function( fun, fileSystem ) {
        var entry = this._getRoot( fileSystem ),
          dirReader = entry.createReader( );

        dirReader.readEntries( function( entries ) {

          for ( var i = 0, len = entries.length, item, result = {
              file: [ ],
              directory: [ ]
            }; i < len; i++ ) {
            //s += entries[i].fullPath;
            item = entries[ i ];

            if ( item.isFile ) {
              result.file.push( item );
            } else {
              result.directory.push( item );
            }

          }

          fun( result, entries );
          entry = null;
          dirReader = null;
        }, this.fileFail );

        return this;
      },
      getParent: function( directory, fun ) {
        directory.getParent( fun, this.fileFail );
        return this;
      },
      readFile: function( name, option, fileSystem ) {
        var entry = this._getRoot( fileSystem ),
          opt = $.extend( {}, this.fileSettings, option );

        entry.getFile( name, opt.flags, function( f ) {

          var reader = new FileReader( );
          reader.onloadend = opt.onEvent;
          reader.readAsText( f );

        }, this.fileFail );

        return this;
      },
      requestFileSystem: function( success, type, size ) {
        var self = this;
        self.defaultFileSystem ? success( self.defaultFileSystem ) : window.requestFileSystem( type || LocalFileSystem.PERSISTENT, size || 0, function( fileSystem ) {
          self.defaultFileSystem = fileSystem;
          self.defaultFullPath = fileSystem.root.fullPath;
          success( fileSystem );
        }, this.fileFail );
        return this;
      },
      resolveLocalFileSystemURI: function( path, success ) {
        window.resolveLocalFileSystemURI( path, success, this.fileFail );
        return this;
      },
      fileSettings: {
        //create: Used to indicate that the file or directory should be created, if it does not exist. (boolean)
        //exclusive: By itself, exclusive has no effect. Used with create, it causes the file or directory creation to fail if the target path already exists. (boolean)
        //http://www.phonegap.cn/?page_id=402
        flags: {
          create: true,
          exclusive: false
        },
        onEvent: null

      },
      fileError: {
        "1": "NOT_FOUND_ERR：没有找到相应的文件或目录的错误",
        "2": "SECURITY_ERR：所有没被其他错误类型所涵盖的安全错误，包括：当前文件在Web应用中被访问是不安全的；对文件资源过多的访问等",
        "3": "ABORT_ERR：中止错误。",
        "4": "NOT_READABLE_ERR：文件或目录无法读取的错误，通常是由于另外一个应用已经获取了当前文件的引用并使用了并发锁",
        "5": "ENCODING_ERR：编码错误",
        "6": "NO_MODIFICATION_ALLOWED_ERR：修改拒绝的错误，当试图写入一个底层文件系统状态决定其不能修改的文件或目录时",
        "7": "INVALID_STATE_ERR：无效状态错误",
        "8": "SYNTAX_ERR：语法错误，用于File Writer对象",
        "9": "INVALID_MODIFICATION_ERR：非法的修改请求错误，例如同级移动（将一个文件或目录移动到它的父目录中）时没有提供和当前名称不同的名称时",
        "10": "QUOTA_EXCEEDED_ERR：超过配额错误，当操作会导致应用程序超过系统所分配的存储配额时",
        "11": "TYPE_MISMATCH_ERR：类型不匹配错误，当试图查找文件或目录而请求的对象类型错误时(例如：当用户请求一个FileEntry是一个DirectoryEntry对象)",
        "12": "PATH_EXISTS_ERR：路径已存在错误，当试图创建路径已经存在的文件或目录时。"
      },
      fileTransferError: {
        "1": "FILE_NOT_FOUND_ERR：文件未找到错误",
        "2": "INVALID_URL_ERR：无效的URL错误",
        "3": "CONNECTION_ERR：连接错误"
      },
      writeFile: function( name, content, option, fileSystem ) {
        var entry = this._getRoot( fileSystem ),
          opt = $.extend( {}, this.fileSettings, option );

        entry.getFile( name, opt.flags, function( fileEntry ) {
          fileEntry.createWriter( function( writer ) {
            writer.onwriteend = opt.onEvent;
            writer.write( content );
          }, this.fileFail );
        }, this.fileFail );

        return this;
      },

      download: function( url, name, success, fail, fullPath ) {
        var fileTransfer = new FileTransfer( );
        fileTransfer.download(
          url, ( fullPath || this.defaultFullPath ) + "/" + name, success, fail
        );
      }
    },

    network: function( ) {
      if ( window.navigator.network ) {
        var networkState = window.navigator.network.connection.type,
          result = false;

        switch ( networkState ) {
          case Connection.NONE:
            result = false;
            break;
          case Connection.WIFI:
            result = 'WIFI';
            break;
          case Connection.UNKNOWN:
            result = 'Unknown';
            break;
          case Connection.ETHERNET:
            result = 'Ethernet';
            break;
          case Connection.CELL_2G:
            result = '2g';
            break;
          case Connection.CELL_3G:
            result = '3g';
            break;
          case Connection.CELL_4G:
            result = '4g';
            break;
        }

        return result;
      }
      return navigator.onLine;
    }
  };
  return phonegap;
} );