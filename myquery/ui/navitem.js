myQuery.define("ui/navitem", [
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

    var navitem = Widget.extend("ui.navitem", {
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

            /*to fix ie*/this.target.width(this.$item.scrollWidth());
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
                    duration: 200,
                    easing: "cubic.easeInOut",
                    complete: function(opt) {
                        dom.css(this, "height", "auto");
                    }
                });
                this.render();

                var para = {
                    type: 'navitem.open',
                    container: this.container,
                    target: this.target[0]
                }

                return this.target.trigger("navitem.open", this.target[0], para);
            }
            return this;
        },
        close: function() {
            var opt = this.options;
            if (opt.onfocus == true) {
                opt.onfocus = false;
                this.$board.slideUp({
                    duration: 200,
                    easing: "cubic.easeInOut"
                });
                this.render();

                var para = {
                    type: 'navitem.close',
                    container: this.container,
                    target: this.target[0]
                }

                return this.target.trigger("navitem.close", this.target[0], para);
            }
            return this;
        },
        hasChild: function() {
            return !!this.target.query("li[myquery-ui-navitem]").length;
        },
        init: function(opt, target) {
            this._super(opt, target);
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

            this.$img = $($.createEle("div")).css({
                "float": "left"
            }).addClass("img");
            //.attr("src", "data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAA" /*to fix chrome border*/ );

            this.$text = $($.createEle("div")).css({
                "float": "left"
            }).addClass("text");

            this.$title = $($.createEle("a")).css({
                "display":"block",
                "text-decoration": "none"
            }).addClass("title");

            this.$board.append(this.$child);

            this.$title.append(this.$arrow).append(this.$img).append(this.$text);

            this.$item.append(this.$title);

            this.target.append(this.$item);

            this.target.append(this.$board);

            this.render()._initHandler().enable();

            return this;
        },
        isOnFocus: function(){
            return this.options.onfocus;
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
            close: 1,
            isOnFocus: 1
        },
        target: null,
        toString: function() {
            return "ui.navitem";
        },
        widgetEventPrefix: "navitem"
    });

    //提供注释
    $.fn.navmenu = function(a, b, c, args) {
        navmenu.apply(this, arguments);
        return this;
    }
    return navitem;
});