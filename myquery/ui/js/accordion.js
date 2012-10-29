/// <reference path="../../myquery.js" />
myQuery.define("ui/js/accordion",
[
   "module/object",
   "module/widget",
   "main/class",
   "main/event",
   "main/CustomEvent",
   "main/dom",
   "module/src",
   "module/animate",
   "html5/css3.transition.animate",
   "module/effect"
]
, function ($, object, widget, css, event, CustomEvent, dom, src) {
    "use strict"; //启用严格模式
    //缺个event 缺个绑定 和解除 缺配置
    src.link({ href: $.basePath + "/ui/css/accordion.css" });

    var Key = object.Class("Key", {
        init: function (item, parent) {
            //                    .data({
            //                        "shell": parent
            //                        , "widgetInfo": item.info
            //                    })
            //                    .attr({ "widgetId": this.id + "." + (item.id || $.now()), "title": item.title || "" })
            this.__super();
            this.parent = parent;

            this.a = $($.createEle("a"))
                    .addClass("unselect")
                    .css({ position: "relative", display: "block", height: "100%", width: "100%" })
                    .html(item.html)
                    .addClass("a");

            this.container = this.key = $($.createEle("li"))
                    .css({ position: "relative", display: "block", width: "100%" })
                    .addClass("key")
                    .attr({ "title": item.title || "" })
                    .append(this.a)
                    .appendTo(this.parent.container);

            this.initHandler();
            return this;
        },
        initHandler: function () {
            var self = this;
            this.key.click(function (e) {
                //                self.setSelectStyle();
                self.trigger("key.select", this, self, e);
                self.setSelectStyle();
            });

            return this;
        },
        setUnselectStyle: function () {
            this.a.addClass("unselect").removeClass("select");
            return this;
        },
        setSelectStyle: function () {
            this.a.addClass("select").removeClass("unselect");
            return this;
        }
    }, CustomEvent);

    var KeyCollection = object.Collection("KeyCollection", {
        init: function (list, parent) {
            this.__super();

            var i = 0,
                len = list.length,
                key,
                item;


            for (; i < len; i++) {//映射表 找到shell 通过name
                item = list[i];
                key = new Key(item, parent);

                this.add(key);
            }
            this.initHandler();
            return this;
        },
        initHandler: function () {
            var self = this;
            this.on("key.select", function (key, e) {
                self.trigger("key.select", this, key, e);
            });
            return this;
        },
        setUnselectStyle: function () {
            return this.each(function (item) {
                item.setUnselectStyle();
            });
        },
        setSelectStyle: function () {
            return this.each(function (item) {
                item.setSelectStyle();
            });
        }
    }, CustomEvent);

    var Shell = object.Class("Shell", {
        init: function (item, parent) {
            this.__super();
            this.parent = parent;

            this.arrow = $($.createEle("div")).css({ "float": "left" }).addClass("arrowRight");

            this.text = $($.createEle("div")).css({ "float": "left" }).addClass("text").html(item.html);

            this.title = $($.createEle("a"))
                    .css({ "float": "clear", position: "relative", display: "block", "text-decoration": "none" })
                    .addClass("title")
                    .addClass("title_unselect")
                    .append(this.arrow)
                    .append(this.text);

            this.container = this.board = $($.createEle("ul"))
                        .css({ position: "relative", width: "100%", display: "block" })
                        .addClass("board")
                        .hide();

            this.shell = $($.createEle("div"))
                    .css({ position: "relative", width: "100%" })
                    .addClass("shell")
                    .attr({ "title": item.title || "" })
                    .append(this.title)
                    .append(this.board)
                    .appendTo(this.parent.container);

            this.keyCollection = new KeyCollection(item.list, this);

            this.onfocus = false;
            this.initHandler();
            return this;

        },
        initHandler: function () {
            var self = this;
            this.title.click(function (e) {
                //self.selectShell(self,)
                self.toggle();
                //self.trigger("title.select", this, e, self);
            });
            this.keyCollection.on("key.select", function (key, e) {
                self.trigger("key.select", this, key, e);
                self.open();
            });
            return this;
        },
        open: function () {
            if (this.onfocus == false) {
                this.onfocus = true;
                this.setOpenStyle();
                this.board.slideDown({
                    duration: 600,
                    easing: "easeInOutCubic"
                });
            }
            return this.trigger("shell.open", this, this);

        },
        close: function () {
            if (this.onfocus == true) {
                this.onfocus = false;
                this.setCloseStyle();
                this.board.slideUp({
                    duration: 600,
                    easing: "easeInOutCubic"
                });
            }
            return this.trigger("shell.close", this, this);
        },
        toggle: function () {
            return this.onfocus ? this.close() : this.open();
        },
        setOpenStyle: function () {
            this.title.addClass("title_select").removeClass("title_unselect");
            this.arrow.addClass("arrowBottom").removeClass("arrowRight");
            return this;
        },
        setCloseStyle: function () {
            this.title.addClass("title_unselect").removeClass("title_select");
            this.arrow.addClass("arrowRight").removeClass("arrowBottom");
            return this;
        },
        render: function () {
            return this.toggle();
        }

    }, CustomEvent);

    var ShellCollection = object.Collection("ShellCollection", {
        init: function (list, parent) {
            //this.parent = parent;
            //this.container = parent.container;
            this.__super();
            var i = 0,
                len = list.length,
                shell,
                item;

            for (; i < len; i++) {//映射表 找到shell 通过name
                item = list[i];
                shell = new Shell(item, parent);
                //parent.append(shell);

                //result.push(shell);
                this.add(shell);
            }
            this.initHandler();
            return this;
        },
        initHandler: function () {
            this.on("key.select", function (key, e) {
                this.each(function (shell) {
                    shell.collectionKey.setUnselectStyle();
                    //配置 

                    return;
                    shell.onfocus && shell.close();
                });
                self.trigger("key.select", this, key, e);
            });
        }
    }, CustomEvent);

    var Accordion = object.Class("Accordion", {
        init: function (target, list) {//, keyId, isDittoShellSelect
            this.__super();
            this.target = $(target);
            this.list = list;
            this.width = this.target.width();
            //this.height = this.target.height();
            //this.id = "Accordion" + "." + (id || $.now());
            this.container = null;
            this.shellCollection = null;
            this._selectShell = null;

            this.create(list).initHandler();

            return this;
        }
        , create: function (list) {

            this.container = $($.createEle("div"))
                .css("position", "relative")
                .addClass("accordion");
            this.shellCollection = new ShellCollection(list, this);

            this.target.append(this.container);

            this.container.outerW(this.width);
            return this;
        }
        , initHandler: function () {
            var self = this;
            //控制其他的
            this.shellCollection.on("key.select", function (key, e) {
                self.trigger("key.select", this, key, e);
            });
            return this;
            //配置
            this.shellCollection
            .on("shell.open", function (shell) {
                //                self.shellCollection.each(function (item) {
                //                    item.onfocus && item.close();
                //                });

                self.trigger("shell.open", this, shell);
            })
            .on("shell.close", function (shell) {
                self.trigger("shell.close", this, shell);
            })

            return this;
        }
        , render: function () {

        }
    }, CustomEvent);

    return Accordion;
});