myQuery.define("ui/js/navitem", [
    "module/Widget",
    "main/class",
    "main/event",
    "main/dom",
    "main/attr",
    "module/animate",
    "html5/css3.transition.animate",
    "module/tween.extend",
    "module/effect"],

function($, Widget, cls, event, dom, attr, src, animate) {
    "use strict"; //启用严格模式

    var navitem = Widget.factory("ui.navitem", {
        container: null,
        customEventName: ["open", "close"],
        event: function() {},
        _initHandler: function() {
            var self = this,
                target = self.target,
                opt = self.options;
            this.event = function(e) {
                switch (e.type) {
                    case "click":
                        self.toggle();
                        break;
                }

            }
            return this;
        },
        enable: function() {
            var fun = this.event;
            this.$title.on("click", fun);
        },
        disable: function() {
            var fun = this.event;
            this.$title.off("click", fun);
        },
        getBoard: function() {
            return this.$board;
        },
        render: function() {
            var opt = this.options;
            this.$text.html(opt.html);
            this.$img.addClass(opt.img);
            if (opt.onfocus) {
                this.$title.addClass("title_select").removeClass("title_unselect");
                this.$arrow.addClass("arrowBottom").removeClass("arrowRight");
            } else {
                this.$title.addClass("title_unselect").removeClass("title_select");
                this.$arrow.addClass("arrowRight").removeClass("arrowBottom");
            }

            if (!this.hasChild()) {
                this.$arrow.removeClass("arrowRight").removeClass("arrowBottom");
            }
            return this;
        },
        toggle: function() {
            return this.options.onfocus ? this.close() : this.open();
        },
        open: function() {
            var opt = this.options;
            if (opt.onfocus == false) {
                opt.onfocus = true;
                this.$board.slideDown({
                    duration: 400,
                    easing: "cubic.easeInOut",
                    complete: function(opt) {
                        dom.css(this, "height", "auto");
                    }
                });
                this.render();

                var para = {
                    type: 'navitem.open',
                    container: this.container,
                    target: this.$board
                }

                return this.target.trigger("navitem.open", this.$board, para);
            }
            return this;
        },
        close: function() {
            var opt = this.options;
            if (opt.onfocus == true) {
                opt.onfocus = false;
                this.$board.slideUp({
                    duration: 400,
                    easing: "cubic.easeInOut"
                });
                this.render();

                var para = {
                    type: 'navitem.close',
                    container: this.container,
                    target: this.$board
                }

                return this.target.trigger("navitem.close", para);
            }
            return this;
        },
        hasChild: function() {
            return !!this.target.query("li[myquery-ui-navitem]").length;
        },
        init: function(obj, target) {
            this.__super(obj, target);
            var opt = this.options;
            this.container = target;

            target.css({
                "display":"block",
                "clear": "both"
            });

            this.$board = target.child().css({
                "display":"block",
                "clear": "both"
            }).addClass("board").hide();

            this.$item = $($.createEle("div")).css({
                "display":"block",
                "clear": "both"
            }).addClass("item");

            this.$arrow = $($.createEle("div")).css({
                "float": "left"
            }).addClass("arrow");

            this.$img = $($.createEle("img")).css({
                "float": "left"
            }).attr("src", "data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAA" /*to fix chrome border*/ );

            this.$text = $($.createEle("div")).css({
                "float": "left"
            }).addClass("text");

            this.$title = $($.createEle("a")).css({
                "display":"block",
                "text-decoration": "none"
            }).addClass("title");

            this.$board.append(this.$child);

            this.$title.append(this.$arrow).append(this.$img).append(this.$text);

            this.$item.append(this.$title)

            this.target.append(this.$item);

            this.target.append(this.$board);

            this.render()._initHandler().enable();

            return this;
        },
        options: {
            html: "",
            img: "",
            onfocus: false
        },
        public: {
            render: 1,
            getBorad: 1,
            open: 1,
            close: 1
        },
        target: null,
        toString: function() {
            return "ui.navitem";
        },
        widgetEventPrefix: "navitem"
    });

    //提供注释
    $.fn.navmenu = function(a, b, c, args) {
        /// <summary>使对象的第一元素可以拖动
        /// <para>bol obj.disabled:事件是否可用</para>
        /// <para>num obj.axis:"x"表示横轴移动;"y"表示纵轴移动;缺省或其他值为2轴</para>
        /// <para>num obj.second:秒数</para>
        /// <para>fun obj.dragstar:拖动开始</para>
        /// <para>fun obj.dragmove:拖动时</para>
        /// <para>fun obj.dragstop:拖动结束</para>
        /// </summary>
        /// <param name="a" type="Object/String">初始化obj或属性名:option或方法名</param>
        /// <param name="b" type="String/null">属性option子属性名</param>
        /// <param name="c" type="any">属性option子属性名的值</param>
        /// <param name="args" type="any">在调用方法的时候，后面是方法的参数</param>
        /// <returns type="$" />
        navmenu.apply(this, arguments);
        return this;
    }
    return navitem;
});