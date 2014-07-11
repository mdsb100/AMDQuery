## 简介
* AMDQuery遵循JQuery的语法
* 内置了类似JQuery-UI
* 使用AMD规范管理模块
* 提供widget创建加载
* 提供了MVC框架来开发web-app
* build工具及CLI
* 加入这个项目

### DEMO
[homepage](http://mdsb100.github.io/homepage/).压缩的。

[homepage](http://mdsb100.github.io/AMDQuery/document/app.html). 非压缩的。


### 还是像JQuery那样使用
```
$.require(["main/query", "main/data", "main/dom"], function( query, utilData, dom) {
    var test = query.getEleById("test");
    var test1 = $("#test1");
    var test1Clone = test1.clone();
} );
```

### 像JQuery-UI那样使用组件
```
$.require(["ui/scrollableview", "main/query", "main/dom", "main/css"], function(scrollableview, query, dom, css) {
  var container1 = $("#container1");

  container1.on("scrollableview.pulldown", function() {
    alert("1")
  }).on("scrollableview.pullup", function() {
    alert("2")
  }).on("scrollableview.pullleft", function() {
    alert("3")
  }).on("scrollableview.pullright", function() {
    alert("4")
  }).on("scrollableview.animationEnd", function(e) {
    alert(e.scene)
  });

  var div = $.createEle("div");
  $(div).css({
    width: "1000px",
    height: "1000px",
    "background-color": "pink"
  });

  container1.uiScrollableview("append", div);

  container1.uiScrollableview("remove", div);

  container1.uiScrollableview("replace", $("#inner")[0], div);

});
```

### 使用AMD规范管理模块
```
aQuery.define( "main/data", [ "base/extend", "base/typed", "base/support" ], function( $, utilExtend, typed, support, undefined ) {
  "use strict";
  return {};
} );
```

### 提供widget创建
```
aQuery.define( "ui/button", [
"base/client",
"module/Widget",
"main/query",
"main/class",
"main/CustomEvent",
"main/event",
"main/css",
"main/position",
"main/dom",
"main/attr",
"html5/css3"
],

function( $, client, Widget, query, cls, CustomEvent, event, css, position, dom, attr, css3 ) {
"use strict";

Widget.fetchCSS( "ui/css/button" );

var button = Widget.extend( "ui.button", {
  container: null,
  _initHandler: function() {
    var self = this;
    this.buttonEvent = function( e ) {
      switch ( e.type ) {
        case "click":
          self.target.trigger( CustomEvent.createEvent( self.getEventName( "click" ), self.target[ 0 ], {
            container: self.container,
            event: e
          } ) );
          break;
      }
    };
    return this;
  },
  enable: function() {
    this.disable();
    this.target.on( "click", this.buttonEvent );
    this.options.disabled = false;
    return this;
  },
  disable: function() {
    this.target.off( "click", this.buttonEvent );
    this.options.disabled = true;
    return this;
  },
  render: function() {
    var opt = this.options,
      ie = client.browser.ie < 9;
    if ( ie ) {
      this.$text.remove();
    }
    this.$text.html( opt.text );
    if ( ie ) {
      this.$text.appendTo( this.container );
    }
    this.container.attr( "title", opt.title );
    return this;
  },
  init: function( opt, target ) {
    this._super( opt, target );

    target.addClass( this.options.defualtCssName );

    this.container = $( $.createEle( "a" ) ).css( {
      "display": "inline-block",
      "text-decoration": "none",
      "width": "100%",
      "height": "100%",
      "position": "relative"
    } ).addClass( "back" );

    this.$img = $( $.createEle( "div" ) ).css( {
      "display": "block",
      "text-decoration": "none",
      "position": "absolute",
      "width": "100%",
      "height": "100%"
    } ).addClass( "img" ).addClass( this.options.icon );

    this.$text = $( $.createEle( "a" ) ).css( {
      "display": "block",
      "text-decoration": "none",
      "position": "absolute",
      "float": "left",
      "width": "100%",
      "height": "100%"
    } ).addClass( "text" );

    this.container.append( this.$img ).append( this.$text );

    target.append( this.container );

    target.css( {
      "float": "left",
      "cursor": "pointer"
    } );

    this.$text.css3( "user-select", "none" );

    this._initHandler().enable().render();

    return this;
  },
  customEventName: [ "click" ],
  options: {
    defualtCssName: "aquery-button",
    text: "clickme",
    title: "",
    icon: "icon"
  },
  getter: {
    defualtCssName: 1,
    text: 1,
    title: 1,
    icon: 0
  },
  setter: {
    defualtCssName: 0,
    text: 1,
    title: 1,
    icon: 0
  },
  publics: {

  },
  target: null,
  toString: function() {
    return "ui.button";
  },
  widgetEventPrefix: "button"
} );

return button;
} );
```

### 加载widget模板
_amdquery-widget="ui.button" ui-button="text:click me;title:test"_
```
<body style="width: 100%; height: 100%;">
<div style="width:65px;height:22px;" id="button" amdquery-widget="ui.button" ui-button="text:click me;title:test"></div>
</body>
```

### MVC
#### 文件分层
```
app
| - assets // assets of application
| - controllers
| - lib // js library in here
| - models
| - styles // css in here
| - views // xml in here
| - app.html // entry
\ - app.js // your application
```
####
#### 创建app
app="src:../document/app;debug:false;development:0;viewContentID:aQueryViewContentKey;"
```
<script src="../amdquery/amdquery.js" type="text/javascript" amdquery="define:$;loadingImage:assets/images/welcome.gif" app="src:../document/app;debug:false;development:0;viewContentID:aQueryViewContentKey;"></script>
```
#### 定义app模块
```
aQuery.define( "@app/app", [ "base/Promise", "main/event", "app/Application", "@app/controllers/index" ], function( $, Promise, event, Application ) {
    "use strict"; //启用严格模式
  //必须依赖index controller
  var app = Application.extend( "Application", {
    init: function( promiseCallback ) {
      this._super();
      this.promise.then( function() {
        var promise = new Promise;
        this.index.document.$content.once( "load", function() {
          promise.resolve();
          promiseCallback.resolve();
        } );

        return promise;
      } );
    },
    launch: function() {

    }
  }, {
    global: {

    }
  } );

  return app;
} );
```

#### 具体细节请参考文档
> [QuickStart](http://mdsb100.github.io/homepage/amdquery/document/document/app.html#docNavmenuKey=application_QuickStart&scrollTo=First)

### build工具及CLI
cd 到 build/
#### 创建app
jake createapp
#### 打包app (xml,css,js,image等)
jake buildapp
#### 生成文档
jake jsdoc
#### [更多](https://github.com/mdsb100/AMDQuery/blob/master/build/jakefile.js)

### 加入这个项目
这是一个大型框架，需要更多人的参与。

如果你对这个项目感兴趣，想加入，很简单，提交你的pull-request。
或者联系mdsb1000@gmail.com