/// <reference path="../../myquery.js" />
myQuery.define("ui/js/turnBook", ["ui/js/swappable", "main/class", "html5/css3"], function ($, swappable, clas, css3, undefined) {
    "use strict"; //启用严格模式
    var turnBook = $.widget("ui.turnBook", function turnbook(obj, target) {
        this.__supper(obj, target).init(obj || {}, target).create();
    }, {
        appendTo: function (index) {
            var box = this.getBox(index);
            box && box.appendTo(this.container[0]);
            return this;
        },
        backgound: null,
        bookWidth: 0,
        bookHeight: 0

        ,
        cache: null,
        container: null,
        create: function () {
            var opt = this.options,
                size;

            this.cache = {};
            this.bookHeight = Math.round(this.target.innerH());
            this.bookWidth = Math.round(this.target.innerW());
            this.pageHeight = this.bookHeight;
            if (opt.positionType == "half") {
                this.pageWidth = this.bookWidth;
                opt.inductionCorner = false;
                this.backgound = $({
                    a: "absolute",
                    b: opt.pageBackgroundColor
                }, "div") //.initTransform3d()
                //$({ b: opt.pageBackgroundColor, w: this.pageWidth, h: this.pageHeight }, "div", this.backgound);
            } else {
                this.pageWidth = this.bookWidth / 2;
            }

            opt.contentWidth = opt.contentWidth || this.pageWidth;
            opt.contentHeight = opt.contentHeight || this.pageHeight;

            this.container = $({
                h: this.bookHeight,
                w: this.bookWidth,
                overflow: "hidden",
                a: "absolute"
            }, "div").appendTo(this.target.swappable());
            this.container.initTransform3d && this.container.initTransform3d();

            this.message = $({
                a: "absolute",
                t: this.bookHeight / 4,
                l: this.bookWidth / 4,
                w: this.bookWidth / 2,
                h: this.bookHeight / 2
            }, "div").replaceClass(opt.messageClass).addHandler("mousedown", function () {
                $(this).hide();
            }).hide();

            //var opt = this.options;
            this.message.css(opt.messageClass);

            this.setSwap(opt.pauseSensitivity, opt.directionRange, opt.cursor)

            this.setBook(opt.bookName, opt.bookType, opt.bookContent, opt.bookIndex).showPages(opt.bookIndex);

            this._bindEvent();
            this.able();

            return this;
        },
        createPage: function () {
            var opt = this.options,
                box = $({
                    w: this.pageWidth,
                    h: this.pageHeight,
                    a: "absolute",
                    overflow: "hidden"
                }, "div"),
                page = $({
                    w: this.pageWidth,
                    h: this.pageHeight,
                    a: "absolute",
                    b: opt.pageBackgroundColor,
                    overflow: "hidden"
                }, "div", box);
            //box.initTransform3d && box.initTransform3d();
            page.box = box;
            return page;
        },
        createContext: function (html) {
            var opt = this.options,
                content;
            switch (opt.bookType) {
                case "Array:Image":
                    content = $({
                        t: opt.contentTop,
                        l: opt.contentLeft,
                        w: opt.contentWidth || this.pageWidth,
                        h: opt.contentHeight || this.pageHeight,
                        a: "absolute",
                        border: "0px",
                        overflow: "hidden"
                        //, color: opt.contentFontColor
                        //, font: opt.contentFont
                        //, b: opt.contentBackgroundColor
                    ,
                        p: "0",
                        cursor: "pointer"
                    }, "img").addHandler("mousedown", function (e) {
                        $.event.document.preventDefault(e);
                    }).replaceClass(opt.contentClass);
                    content[0].setAttribute("src", html);
                    break;
                case "Array:String":
                default:
                    content = $({
                        t: opt.contentTop,
                        l: opt.contentLeft,
                        w: opt.contentWidth || this.pageWidth,
                        h: opt.contentHeight || this.pageHeight,
                        a: "absolute",
                        resize: "none",
                        border: "0px",
                        overflow: "hidden",
                        color: opt.contentFontColor,
                        font: opt.contentFont,
                        b: opt.contentBackgroundColor,
                        p: "0",
                        pointerEvents: "auto",
                        cursor: "pointer"
                    }, "textArea").addHandler("mousedown", function (e) {
                        $.event.document.preventDefault(e);
                    }).replaceClass(opt.contentClass).html(html || "");
                    content[0].setAttribute("readonly", "readonly");
                    if ($.isIpad) {
                        var clip = $({
                            t: opt.contentTop,
                            l: opt.contentLeft,
                            w: opt.contentWidth || this.pageWidth,
                            h: opt.contentHeight || this.pageHeight,
                            a: "absolute"
                        }, "div");
                        content = $([content[0], clip[0]]);
                    }
                    break;

            }
            return content;
        },
        customEventName: ["star", "move", "pause", "stop"]

        ,
        disable: function () {
            //var event = this.event();
            this.container.swappable({
                start: null,
                stop: null,
                move: null,
                pause: null,
                mousemove: null
            }); //.removeHandler("mouseout", event);
        }

        ,
        event: function () {

        },
        enable: function () {
            var event = this.event;
            this.disable();
            this.container.swappable({
                start: event,
                stop: event,
                move: event,
                pause: event,
                mousemove: event
            }); //.addHandler("mouseout", event);
        }

        ,
        getBox: function (index) {
            var page = this.getPage(index),
                box = page != undefined ? page.box : undefined;
            return box
        },
        getContent: function (index) {
            return this.options.contents[index];
        },
        getPage: function (index) {
            return this.options.pages[index];
        }

        ,
        hideMessage: function () {
            this.message.hide();
        }

        ,
        init: function (obj, target) {
            this.option(obj);
            var opt = this.options;
            if (opt.bookType != "half" && opt.bookIndex % 2) {
                opt.bookIndex += 1;
            }
            return this;
        },
        inductionCorner: function (x, y) {
            var opt = this.options,
                result = false;
            //&& opt.positionType != "half"
            //                if (y <= opt.inductionWidth)
            //                    result = true;
            //                else if (y >= this.bookHeight - opt.inductionWidth)
            //                    result = true;
            //if (result) {
            if (x <= opt.inductionWidth) {
                result = true
            } else if (x >= this.bookWidth - opt.inductionWidth) {
                result = true
            } else {
                result = false;
            }

            return result;

        },
        isInLeft: function (x) {
            return x < this.bookWidth / 2;
        },
        isInRight: function (x) {
            return x > this.bookWidth / 2;
        }

        ,
        message: null

        ,
        options: {
            bookName: "default",
            bookType: "Array:String",
            bookContent: null,
            bookIndex: 0

            ,
            contents: [],
            contentTop: 0,
            contentLeft: 0,
            contentHeight: 0,
            contentWidth: 0,
            contentFontColor: "black",
            contentBackgroundColor: "white",
            contentClass: "myquery_turnbook_content",
            contentFont: "12px",
            cursor: 'pointer'

            ,
            inductionWidth: 20,
            isShowMessage: true,
            inductionCorner: true

            ,
            directionRange: 22.5,
            disabled: true

            ,
            messageHideTime: 1500,
            messageClass: "myquery_turnbook_message"

            ,
            pages: [],
            pageBackgroundColor: "white"

            ,
            positionType: "whole",
            pauseSensitivity: 500
        }

        ,
        pageHeight: 0,
        pageWidth: 0,
        public: {
            hideMessage: 1,
            inductionCorner: 1,
            setBook: 1,
            setSwap: 1,
            showMessage: 1,
            showPages: 1,
            isInLeft: 1,
            isInRight: 1
        },
        _bindEvent: function () {
            var self = this,
                target = self.target,
                opt = self.options,
                bookWidth = self.bookWidth,
                pageWidth = self.pageWidth,
                shadow = "10px 4px 2px rgba(0,0,0,.6),-5px 4px 2px rgba(0,0,0,.6)",
                mouseshow, turnNextHalf = function (index, offsetX) {
                    self.setBoxCss(index, {
                        w: $.between(0, pageWidth, pageWidth + offsetX - bookWidth)
                    })
                    self.setCss(self.backgound, {
                        w: $.between(0, pageWidth, (bookWidth - offsetX) / 2),
                        l: offsetX,
                        boxShadow: shadow
                    }, {
                        tx: offsetX
                    });
                },
                turnPreHalf = function (index, offsetX) {
                    index && self.setCss(self.backgound, {
                        w: $.between(0, pageWidth, (bookWidth - offsetX) / 2),
                        l: offsetX,
                        boxShadow: shadow
                    }, {
                        tx: offsetX
                    })
                },
                turnNextWhole = function (index, offsetX) {
                    self.setBoxCss(index, {
                        w: $.between(0, pageWidth, pageWidth + offsetX - bookWidth)
                    }).setBoxCss(index + 1, {
                        w: $.between(0, pageWidth, (bookWidth - offsetX) / 2),
                        l: offsetX,
                        boxShadow: shadow
                    }, {
                        tx: offsetX
                    });
                },
                turnPreWhole = function (index, offsetX) {
                    self.setBoxCss(index - 1, {
                        w: $.between(0, pageWidth, pageWidth - offsetX),
                        l: offsetX
                    }, {
                        tx: offsetX
                    }).setPageCss(index - 1, {
                        l: -offsetX
                    }).setBoxCss(index - 2, {
                        w: Math.ceil($.between(0, pageWidth, offsetX / 2)),
                        l: offsetX / 2,
                        boxShadow: shadow
                    }, {
                        tx: offsetX / 2
                    }).setPageCss(index - 2, {
                        l: $.between(-pageWidth, 0, offsetX / 2 - pageWidth)
                    });
                };
            this.event = function (e) {
                var index = opt.bookIndex,
                    offsetX = e.offsetX,
                    offsetY = e.offsetY;
                switch (e.type) {
                    case "swap.mousemove":
                        //只会在非无线端有作用
                        //var x = (e.pageX || e.clientX) - self.target.getLeft(), y = (e.pageY || e.clientY) - self.target.getTop();
                        var x = e.offsetX,
                        y = e.offsetY;
                        if (opt.inductionCorner == true && self.inductionCorner(x, y)) {
                            mouseshow = true;
                            if (opt.positionType != "half") {
                                self.isInLeft(x) ? turnPreWhole(index, x) : turnNextWhole(index, x);
                            }
                        } else {
                            if (mouseshow) {
                                mouseshow = false;
                                self.showPages(index);
                            }
                        }
                        break;
                    case "swap.start":
                        e.type = "turnbookstart";
                        target.trigger("turnbookstart", self, e);
                        break;
                    case "swap.move":
                        if (opt.positionType == "half") {
                            switch (e.direction) {
                                case 7:
                                    //向后翻页
                                case 0:
                                case 1:
                                    self.isInRight(e.startX) ? turnNextHalf(index, offsetX) : turnPreHalf(index, offsetX);
                                    break;
                                case 3:
                                    //向前翻页
                                case 4:
                                case 5:
                                    self.isInLeft(e.startX) ? turnPreHalf(index, offsetX) : turnNextHalf(index, offsetX);
                                    break;
                            }
                        } else {
                            switch (e.direction) {
                                case 7:
                                    //向后翻页
                                case 0:
                                case 1:
                                    self.isInRight(e.startX) ? turnNextWhole(index, offsetX) : turnPreWhole(index, offsetX);
                                    break;
                                case 3:
                                    //向前翻页
                                case 4:
                                case 5:
                                    self.isInLeft(e.startX) ? turnPreWhole(index, offsetX) : turnNextWhole(index, offsetX);
                                    break;
                            }
                        }
                        e.type = "turnbookmove";
                        target.trigger("turnbookmove", self, e);
                        break;
                    case "swap.pause":
                        //$.showMsg("pause");
                        e.type = "turnbookpause";
                        target.trigger('turnbookpause', self, e);
                        break;
                    case "swap.stop":
                        switch (e.direction) {
                            case 7:
                                //向后翻页
                            case 0:
                            case 1:
                                self.render("right", e.startX);
                                break;
                            case 3:
                                //向前翻页
                            case 4:
                            case 5:
                                self.render("left", e.startX);
                                break;
                        }
                        e.type = "turnbookstop";
                        target.trigger('turnbookstop', self, e);
                        break;
                    //                    case "mouseout":                                                                        
                    //                        if (opt.inductionCorner == true && mouseshow) {                                                                        
                    //                            self.showPages(index);                                                                        
                    //                        }                                                                        
                    //                        break;                                                                        
                }
            }

        },
        render: function (direction, startX) {
            var opt = this.options;
            if (direction == "right") {
                if (opt.bookIndex >= opt.pages.length - 1) {
                    this.showPages(opt.bookIndex);
                    opt.positionType == "half" && this.showMessage("已经到最后一页");
                } else {
                    if (opt.positionType == "half") this.showPages(opt.bookIndex + 1);
                    else this.isInRight(startX) ? this.showPages(opt.bookIndex + 2) : this.showPages(opt.bookIndex);
                }
            } else if (direction == "left") {
                if (opt.bookIndex <= 0) {
                    this.showPages(opt.bookIndex);
                    opt.positionType == "half" && this.showMessage("已经到第一页");
                } else {
                    if (opt.positionType == "half") this.showPages(opt.bookIndex - 1);
                    else this.isInLeft(startX) ? this.showPages(opt.bookIndex - 2) : this.showPages(opt.bookIndex);
                }
            }
            return this;
        }

        ,
        setBook: function (bookName, bookType, bookContent, bookIndex) {
            var opt = this.options,
                cache = this.cache[bookName];
            if (cache) {
                opt.pages = cache.pages;
                opt.contents = cache.contents;
                opt.bookType = cache.bookType;
                opt.bookIndex = cache.bookIndex;
            } else {
                if (bookContent) {
                    switch (bookType) { //加载1000页的速度还是很快的，如果很慢，需要动态加载，实现不复杂，看需求
                        case "Array:Image":
                            var page, content, len = bookContent.length //, i = 1, value;
                            opt.pages = [];
                            opt.contents = [];
                            len % 2 == 1 && bookContent.push("");
                            $.each(bookContent, function (value, index) {
                                page = this.createPage();
                                opt.pages[index] = page;
                                content = this.createContext(value).appendTo(page);
                                //opt.contents[index] = $.isIpad ? $(content[0]) : content;
                            }, this);
                            break;
                        case "Array:String":
                        default:
                            var page, content, len = bookContent.length //, i = 1, value;
                            opt.pages = [];
                            opt.contents = [];
                            len % 2 == 1 && bookContent.push("");
                            $.each(bookContent, function (value, index) {
                                page = this.createPage();
                                opt.pages[index] = page;
                                content = this.createContext(value).appendTo(page);
                                opt.contents[index] = $.isIpad ? $(content[0]) : content;
                            }, this);

                            break;

                    }
                    opt.bookIndex = bookIndex || 0;
                    this.cache[opt.bookName] = {
                        pages: opt.pages,
                        contents: opt.contents,
                        bookType: bookType,
                        bookIndex: opt.bookIndex
                    };
                }
            }
            return this;
        },
        setBoxCss: function (index, css, css3d) {
            var opt = this.options,
                box = this.getBox(index);
            box && this.setCss(box, css, css3d);
            return this;
        },
        setContextCss: function (index, css) {
            var opt = this.options,
                content = this.getContent(index);
            if (content) {
                css = css || {};
                css.color = opt.contentFontColor;
                css.backgroundColor = opt.contentBackgroundColor;
                css.font = opt.contentFont;
                switch (opt.bookType) {
                    case "Array:String":
                        content.css(css);
                        break;
                }
            }
            return this;
        },
        setPageCss: function (index, css, css3d) {
            var opt = this.options,
                page = this.getPage(index);
            if (page) {
                css = css || {};
                css.b = opt.pageBackgroundColor; //必须实现的
                this.setCss(page, css, css3d);
            }
            return this;
        },
        setCss: function (item, css, css3d) {
            if (css3d && $.support.transform3d) {
                delete css.l;
                delete css.left;
                delete css.t;
                delete css.top;
                item.transform3d(css3d);
            }
            item.css(css);
            if (css.boxShadow != undefined) {
                item.css3({
                    boxShadow: css.boxShadow
                });
            }
            return this;
        }

        ,
        setSwap: function (pauseSensitivity, directionRange, cursor) {
            var opt = this.options;
            pauseSensitivity = pauseSensitivity || opt.pauseSensitivity;
            directionRange = directionRange || opt.directionRange;
            cursor = cursor || opt.cursor;
            this.container.swappable({
                pauseSensitivity: pauseSensitivity,
                directionRange: directionRange,
                cursor: cursor
            });
            opt.pauseSensitivity = pauseSensitivity;
            opt.directionRange = directionRange;
            opt.cursor = cursor;
        },
        showPages: function (index) {
            var opt = this.options,
                begin, close, len = opt.pages.length - 1,
                pageWidth = this.pageWidth,
                bookWidth = this.bookWidth;
            this.container.child(null, false).remove();
            index = $.isNum(index) ? parseInt($.between(0, len, index)) : opt.bookIndex;
            if (opt.positionType == "half") {
                for (var i = index + 2; i >= index; i--) {
                    this.setContextCss(i).setBoxCss(i, {
                        l: 0,
                        w: pageWidth
                    }, {
                        tx: 0
                    }).setPageCss(i, {
                        l: 0
                    }).appendTo(i);
                }
                this.setContextCss(i - 1).setBoxCss(i - 1, {
                    l: -pageWidth,
                    w: pageWidth
                }, {
                    tx: -pageWidth
                }).setPageCss(i - 1, {
                    l: 0
                }).appendTo(i - 1);

                this.setCss(this.backgound, {
                    l: 0,
                    w: this.pageWidth,
                    h: this.pageHeight,
                    boxShadow: ""
                }, {
                    tx: this.pageWidth
                });
                this.backgound.appendTo(this.container[0]);
            } else {
                if (index % 2) index += 1;

                this.setContextCss(index - 3).setBoxCss(index - 3, {
                    l: 0,
                    w: pageWidth,
                    boxShadow: ""
                }, {
                    tx: 0
                }).setPageCss(index - 3, {
                    l: 0
                }).appendTo(index - 3);

                this.setContextCss(index - 1).setBoxCss(index - 1, {
                    l: 0,
                    w: pageWidth,
                    boxShadow: ""
                }, {
                    tx: 0
                }).setPageCss(index - 1, {
                    l: 0
                }).appendTo(index - 1);

                this.setContextCss(index + 2).setBoxCss(index + 2, {
                    l: pageWidth,
                    w: pageWidth,
                    boxShadow: ""
                }, {
                    tx: pageWidth
                }).setPageCss(index + 2, {
                    l: 0
                }).appendTo(index + 2);

                this.setContextCss(index).setBoxCss(index, {
                    l: pageWidth,
                    w: pageWidth,
                    boxShadow: ""
                }, {
                    tx: pageWidth
                }).setPageCss(index, {
                    l: 0
                }).appendTo(index);

                this.setContextCss(index + 1).setBoxCss(index + 1, {
                    l: bookWidth,
                    w: pageWidth,
                    boxShadow: ""
                }, {
                    tx: bookWidth
                }).setPageCss(index + 1, {
                    l: 0
                }).appendTo(index + 1)
                this.setContextCss(index - 2).setBoxCss(index - 2, {
                    l: -pageWidth,
                    w: pageWidth,
                    boxShadow: ""
                }, {
                    tx: -pageWidth
                }).setPageCss(index - 2, {
                    l: 0
                }).appendTo(index - 2)
            }
            this.cache[opt.bookName].bookIndex = opt.bookIndex = index;
        },
        showMessage: function (msg, autoHide) {
            if (this.options.isShowMessage !== true) return this.hideMessage();
            this.message.appendTo(this.container).show();
            if ($.isStr(msg)) {
                this.message.html(msg);
            } else {
                this.message.append(msg);
            }
            if (autoHide === false) return;
            var self = this;
            setTimeout(function () {
                self.hideMessage();
            }, this.options.messageHideTime);

        }

        ,
        target: null,
        toString: function () {
            return "ui.turnbook";
        }

        ,
        widgetEventPrefix: "turnbook"
    });

    //提供注释
    $.fn.turnBook = function (a, b, c, args) {
        /// <summary>翻书
        /// <para>大小位置关系初始化后不得修改</para>
        /// <para>str obj.bookName:书名 缺省"default"</para>
        /// <para>str obj.bookType:书的类型 缺省"Array:String"</para>
        /// <para>any obj.bookContent:书的内容 不可缺省</para>
        /// <para>num obj.bookIndex: 第几页 缺省0</para>
        /// <para>num obj.contentTop:内容x坐标位置 缺省0</para>
        /// <para>num obj.contentLeft:内容y坐标位置 缺省0</para>
        /// <para>num obj.contentHeight:内容的高度 缺省0</para>
        /// <para>num obj.contentWidth: 内容的宽度 缺省0</para>
        /// <para>str obj.contentFontColor:内容字体颜色 缺省"black"</para>
        /// <para>str obj.contentBackgroundColor:内容背景色 缺省"白色"</para>
        /// <para>str obj.contentClass:内容样式名 缺省"myquery_turnbook_content"</para>
        /// <para>str obj.contentFont:内容字体大小 缺省12px</para>
        /// <para>str obj.cursor:鼠标样式 缺省"pointer"</para>
        /// <para>num obj.inductionWidth:边缘捕捉范围 缺省20</para>
        /// <para>bol obj.isShowMessage:是否显示信息 缺省true</para>
        /// <para>bol obj.inductionCorner: 是否捕捉边缘 缺省true</para>
        /// <para>num obj.directionRange:swappable的相关属性 缺省22.5</para>
        /// <para>bol obj.disabled:是否启用 缺省true</para>
        /// <para>num obj.messageHideTime:信息框隐藏时间 单位毫秒 缺省1500</para>
        /// <para>str obj.messageClass:信息框样式名 缺省myquery_turnbook_message</para>
        /// <para>str obj.pageBackgroundColor:背景层颜色 缺省"white"</para>
        /// <para>str obj.positionType: 书的形态 半本为"half" 整本为"whole" 缺省"whole"</para>
        /// <para>fun obj.trunbookstart:滑动开始</para>
        /// <para>fun obj.trunbookmove:滑动</para>
        /// <para>fun obj.trunbookpause:滑动结束</para>
        /// <para>fun obj.trunbookstop:滑动暂停</para>
        /// </summary>
        /// <param name="a" type="Object/String">初始化obj或属性名:option或方法名</param>
        /// <param name="b" type="String/null">属性option子属性名</param>
        /// <param name="c" type="any">属性option子属性名的值</param>
        /// <param name="args" type="any">在调用方法的时候，后面是方法的参数</param>
        /// <returns type="$" />
        turnBook.apply(this, arguments);
        return this;
    }

    return turnBook;
});