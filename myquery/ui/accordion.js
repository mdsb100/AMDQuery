myQuery.define("ui/accordion", [
    "module/object",
    "module/Widget",
    "main/class",
    "main/event",
    "main/CustomEvent",
    "main/dom",
    "module/src",
    "module/animate",
    "html5/css3.transition.animate",
    "module/effect"], function($, object, Widget, css, event, CustomEvent, dom, src) {
    "use strict"; //启用严格模式
    //缺个event 缺个绑定 和解除 缺配置
    src.link({
        href: $.getPath("ui/css/accordion", ".css")
    });

    var Key = object.extend("Key", {
        init: function(key, parent) {
            this._super();
            this.parent = parent;
            this.originKey = $(key);
            this.customHandler = this.originKey.attr("widget-handler");
            this.html = this.originKey.html();
            this.title = this.originKey.attr("widget-title") || this.html;
            this.widgetId = this.originKey.attr("widget-id") || this.title;
            this.originKey.html("");

            return this.create().initHandler().addHandler();
        },
        create: function() {
            this.$a = $($.createEle("a"))
                .addClass("unselect")
                .css({
                position: "relative",
                display: "block",
                height: "100%",
                width: "100%"
            })
                .html(this.html)
                .addClass("a");

            this.container = this.$key = this.originKey.css({
                position: "relative",
                display: "block",
                width: "100%"
            })
                .addClass("key")
                .attr({
                "title": this.title
            })
                .append(this.$a)
                .appendTo(this.parent.container);

            return this;

        },
        event: function() {

        },
        initHandler: function() {
            var self = this;
            this.event = function(e) {
                //                self.setSelectStyle();
                self.selectKey(e);
            }
            return this;
        },
        addHandler: function() {
            this.$key.click(this.event);
            return this;
        },
        removeHandler: function() {
            this.$key.off("click", this.event);
            return this;
        },
        setUnselectStyle: function() {
            this.$a.addClass("unselect").removeClass("select");
            return this;
        },
        setSelectStyle: function() {
            this.$a.addClass("select").removeClass("unselect");
            return this;
        },
        selectKey: function(e) {
            this.trigger("key.select", this, this, e);
            this.setSelectStyle();
        },
        routing: function(widgetId) {
            return this.widgetId == widgetId;
        }
    }, CustomEvent);

    var KeyCollection = object.Collection("KeyCollection", {
        init: function(keys, parent) {
            this._super();
            this.parent = parent;
            this.container = parent.container;
            var i = 0,
                len = keys.length,
                key,
                item;

            for (; i < len; i++) { //映射表 找到shell 通过name
                item = keys[i];
                key = new Key(item, this);

                this.add(key);
            }
            this.initHandler().addHandler();
            return this;
        },
        event: function() {

        },
        initHandler: function() {
            var self = this;
            this.event = function(key, e) {
                //self.setUnselectStyle();
                //key.setSelectStyle();
                self.trigger("key.select", this, key, e);
            }

            return this;
        },
        addHandler: function() {
            this.onChild("key.select", this.event);
            return this;
        },
        removeHandler: function() {
            this.offChild("key.select", this.event);
            return this;
        },
        setUnselectStyle: function() {
            return this.each(function(item) {
                item.setUnselectStyle();
            });
        },
        setSelectStyle: function() {
            return this.each(function(item) {
                item.setSelectStyle();
            });
        },

        onChild: function(type, fn) {
            var list = this.models,
                i;
            for (i in list) {
                list[i].on(type, fn);
            }
            return this;
        },
        offChild: function() {
            var list = this.models,
                i;
            for (i in list) {
                list[i].off(type, fn);
            }
            return this;
        }
    }, CustomEvent);

    var Shell = object.extend("Shell", {
        init: function(shell, parent) {
            this._super();
            this.parent = parent;
            this.originShell = $(shell);
            this.customHandler = this.originShell.attr("widget-handler");
            this.html = this.originShell.attr("widget-html");
            this.title = this.originShell.attr("widget-title") || this.html;
            this.widgetId = this.originShell.attr("widget-id") || this.title;

            this.originShell.removeAttr("title");

            this.onfocus = false;

            return this.create().initHandler().addHandler();

        },
        create: function() {
            this.$arrow = $($.createEle("div")).css({
                "float": "left"
            }).addClass("arrowRight");

            this.$text = $($.createEle("div")).css({
                "float": "left"
            }).addClass("text").html(this.html);

            this.$title = $($.createEle("a"))
                .css({
                "clear": "left",
                position: "relative",
                display: "block",
                "text-decoration": "none"
            })
                .addClass("title")
                .addClass("title_unselect")
                .append(this.$arrow)
                .append(this.$text);

            this.container = this.$board = this.originShell.css({
                position: "relative",
                width: "100%",
                display: "block"
            })
                .addClass("board")
                .hide();

            this.$shell = $($.createEle("div"))
                .css({
                position: "relative",
                width: "100%"
            })
                .addClass("shell")
                .attr({
                "title": this.title
            })
                .append(this.$title)
                .append(this.$board)
                .appendTo(this.parent.container);

            this.$text.width(this.$board.width() - this.$arrow.width());

            this.keyCollection = new KeyCollection(this.$board.child(), this);
            return this;
        },
        event: {
            click: function() {},
            keyselect: function() {}
        },
        initHandler: function() {
            var self = this;
            this.event.click = function(e) {
                self.toggle(e);
            }
            this.event.keyselect = function(key, e) {
                self.trigger("key.select", this, "key.select", key, e);
                self.open(key, e);
            }
            return this;
        },
        addHandler: function() {
            this.$title.click(this.event.click);
            this.keyCollection.on("key.select", this.event.keyselect);
            return this;
        },
        removeHandler: function(argument) {
            this.$title.off("click", this.event.click);
            this.keyCollection.off("key.select", this.event.keyselect);
            return this;
        },
        open: function(key, e) {
            if (this.onfocus == false) {
                this.onfocus = true;
                this.setOpenStyle();
                this.$board.slideDown({
                    duration: 400,
                    easing: "cubic.easeInOut"
                });
            }
            return this.trigger("shell.open", this, "shell.open", this);

        },
        close: function() {
            if (this.onfocus == true) {
                this.onfocus = false;
                this.setCloseStyle();
                this.$board.slideUp({
                    duration: 400,
                    easing: "cubic.easeInOut"
                });
            }
            return this.trigger("shell.close", this, "shell.close", this);
        },
        toggle: function(e) {
            this.trigger("shell.select", this, "shell.select", this, e);
            this.onfocus ? this.close() : this.open();
            return this;
        },
        setOpenStyle: function() {
            this.$title.addClass("title_select").removeClass("title_unselect");
            this.$arrow.addClass("arrowBottom").removeClass("arrowRight");
            return this;
        },
        setCloseStyle: function() {
            this.$title.addClass("title_unselect").removeClass("title_select");
            this.$arrow.addClass("arrowRight").removeClass("arrowBottom");
            return this;
        },
        render: function() {
            return this.toggle();
        },
        routing: function(widgetId) {
            return this.widgetId == widgetId;
        }
    }, CustomEvent);

    var ShellCollection = object.Collection("ShellCollection", {
        init: function(shells, parent) {
            //this.parent = parent;
            //this.container = parent.container;
            this._super();
            this.parent = parent;
            this.container = parent.container;
            var i = 0,
                len = shells.length,
                shell,
                item;

            for (; i < len; i++) { //映射表 找到shell 通过name
                item = shells[i];
                shell = new Shell(item, this);
                //parent.append(shell);

                //result.push(shell);
                this.add(shell);
            }
            this.initHandler().addHandler();
            return this;
        },

        event: function() {

        },

        initHandler: function() {
            var self = this;
            this.event = function(type, target, e) {
                if (type == "shell.select") {
                    self.closeOther(target);
                }
                if (type == "key.select") {
                    self.each(function(shell) {
                        shell.keyCollection.setUnselectStyle();
                    });
                }
                self.trigger(type, this, type, target, e);
            }
            return this;
        },
        addHandler: function() {
            this.onChild("key.select", this.event)
                .onChild("shell.open", this.event)
                .onChild("shell.close", this.event)
                .onChild("shell.select", this.event);
            return this;
        },
        removeHandler: function() {
            this.offChild("key.select", this.event)
                .offChild("shell.open", this.event)
                .offChild("shell.close", this.event)
                .offChild("shell.select", this.event);
            return this;
        },
        closeOther: function(except) {
            this.parent.option.oneSelect && this.each(function(shell) {
                except != shell && shell.onfocus && shell.close();
            }, this);
            return this;
        },

        onChild: function(type, fn) {
            var list = this.models,
                i;
            for (i in list) {
                list[i].on(type, fn);
            }
            return this;
        },
        offChild: function(type, fn) {
            var list = this.models,
                i;
            for (i in list) {
                list[i].off(type, fn);
            }
            return this;
        },
        getShell: function(shell) {
            var ret = null,
                item, i, list = this.models;
            if ($.isStr(shell)) {
                for (i in list) {
                    item = list[i];
                    if (item.widgetId == shell) {
                        ret = item;
                        break
                    }
                }
            } else if ($.isEle(shell)) {
                for (i in list) {
                    item = list[i];
                    if (item.originShell == shell) {
                        ret = item;
                        break
                    }
                }
            } else if (shell instanceof Shell) {
                ret = Shell;
            }
            return ret;
        },
        selectShell: function(shell) {
            var ret = this.getShell(shell);
            if (ret != null) {
                ret.toggle();
            }
            return this
        }
    }, CustomEvent);

    var Accordion = object.extend("Accordion", {
        init: function(target, option) { //, keyId, isDittoShellSelect
            this._super();
            this.target = $(target);
            this.width = this.target.width();
            //this.height = this.target.height();
            //this.id = "Accordion" + "." + (id || $.now());
            this.container = null;
            this.shellCollection = null;
            this._selectShell = null;
            this.option = $.extend({}, this.defaultSetting, option);
            this.create()._initHandler().enable();

            return this;
        },
        create: function() {
            this.container = $($.createEle("div"))
                .css("position", "relative")
                .addClass("accordion");
            var shells = this.target.child();
            this.container.append(shells).appendTo(this.target);

            this.container.outerW(this.width);

            this.shellCollection = new ShellCollection(shells, this);
            return this;
        },
        _initHandler: function() {
            var self = this;
            //控制其他的
            //配置
            this.event = function(type, target, e) {
                self.trigger(type, this, type, target, e);
            }

            return this;
        },
        enable: function() {
            this.shellCollection.on("key.select", this.event)
                .on("shell.open", this.event)
                .on("shell.close", this.event)
                .on("shell.select", this.event);
            return this;
        },
        disable: function() {
            this.shellCollection.off("key.select", this.event)
                .off("shell.open", this.event)
                .off("shell.close", this.event)
                .off("shell.select", this.event);
            return this;
        },
        render: function() {

        },
        defaultSetting: {
            oneSelect: 0
        },
        selectShell: function(shell) {
            this.shellCollection.selectShell(shell);
            return this;
        }
    }, CustomEvent);

    var accordion = Widget.extend("ui.accordion", {
        container: null,
        customEventName: ["key.select", "shell.open", "shell.close", "shell.select"],
        event: function() {

        },
        enable: function() {
            this.disable();
            this.accordion.enable()
                .on("key.select", this.event)
                .on("shell.select", this.event)
                .on("shell.open", this.event)
                .on("shell.close", this.event);
        },
        disable: function() {
            this.accordion.disable()
                .on("key.select", this.event)
                .on("shell.select", this.event)
                .on("shell.open", this.event)
                .on("shell.close", this.event);
        },
        init: function(opt, target) {
            this._super(opt, target);
            target.attr("myquery-ui", "accordion");
            this.accordion = new Accordion(target[0], this.options);
            this.options = this.accordion.option;
            this._initHandler();
            this.able();
            return this;
        },
        options: {
            disable: 1,
            oneSelect: 0
        },
        setter: {
            disable: 0,
            oneSelect: 0
        },
        publics: {
            selectShell: 1
        },
        _initHandler: function() {
            var self = this;
            this.event = function(type, target, e) {
                self.target.trigger(self.widgetEventPrefix + "." + type, self.target[0], target, e);
                var handler;
                switch (type) {
                    case "key.select":
                        (handler = target.customHandler) && self.target.trigger(self.getEventName("key." + handler), this, target, e);
                        break;
                    case "shell.select":
                        (handler = target.customHandler) && self.target.trigger(self.getEventName("shell." + handler), this, target, e);
                        break;
                }
            }
        },
        selectShell: function(shell) {
            this.accordion.selectShell(shell);
        },
        target: null,
        toString: function() {
            return "ui.accordion";
        },
        widgetEventPrefix: "accordion"
    });

    //提供注释
    $.fn.accordion = function(a, b, c, args) {
        /// <summary>可以参考charcode列表绑定快捷键
        /// <para>arr obj.keylist:快捷键列表</para>
        /// <para>{ type: "keyup", keyCode: "Enter" </para>
        /// <para>    , fun: function (e) { </para>
        /// <para>        todo(this, e); </para>
        /// <para>    }, combinationKey: ["alt","ctrls"] </para>
        /// <para>} </para>
        /// </summary>
        /// <param name="a" type="Object/String">初始化obj或属性名:option或方法名</param>
        /// <param name="b" type="String/null">属性option子属性名</param>
        /// <param name="c" type="any">属性option子属性名的值</param>
        /// <param name="args" type="any">在调用方法的时候，后面是方法的参数</param>
        /// <returns type="$" />
        return accordion.apply(this, arguments);
    }

    return Accordion;
});