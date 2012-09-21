/// <reference path="../myquery.js" />

myQuery.define("main/dom", function ($, undefined) {
    "use strict"; //启用严格模式
    //和jquery做个测试
    var 
    tools = {
        editCssType: function (name) {
            /// <summary>把简写转为真正语义</summary>
            /// <param name="name" type="String"></param>
            /// <returns type="Object" />
            var temp, unit = '';
            switch (name) {
                case 'a': name = 'position'; break;
                case 'b': name = 'backgroundColor'; break;
                case 'd': name = 'display'; break;
                case 'cssFloat':
                case 'float': name = $.support.cssFloat ? 'cssFloat' : 'styleFloat'; break;
                case 'h': unit = 'px'; name = 'height'; break;
                case 'innerHtml':
                case 'i': name = this.html; break;
                case 'l': unit = 'px'; name = 'left'; break;
                case 'm': name = 'margin'; break;
                case 'opacity':
                case 'o': name = this.opacity; break;
                case 'p': name = 'padding'; break;
                case 't': unit = 'px'; name = 'top'; break;
                case 'v': name = 'value'; break;
                case 'vi': name = 'visibility'; break;
                case 'w': unit = 'px'; name = 'width'; break;
                case 'z': name = 'zIndex'; break;
            }
            if ((temp = $.interfaces.trigger.call(this, "editCssType", name))) {
                name = temp.name;
                unit = temp.unit;
            }
            return { name: name, unit: unit };
        }
    }
    , getPosValue = function (ele, type) {
        return parseFloat(dom.curCss(ele, type) || 0);
    }
    , dom = {
        css: function (ele, name, value) {
            /// <summary>为元素添加样式</summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="name" type="String">样式名</param>
            /// <param name="value" type="str/num">值</param>
            /// <returns type="self" />
            if (value == undefined) {
                return ele.style[name]
            } else {
                ele.style[name] = value;
                return this;
            }
        }
        , curCss: function (ele, name) {
            /// <summary>返回原始原始值 可能有bug</summary>
            /// <param name="ele" type="Element">元素</param>
            /// <param name="name" type="String">样式名</param>
            /// <returns type="any" />

            //quote from jQuery-1.7.2 
            var result;

            if (document.defaultView && document.defaultView.getComputedStyle) {
                //quote from jQuery1.7.2
                var defaultView, computedStyle, width,
			    style = ele.style;

                name = name.replace($.reg.rupper, "-$1").toLowerCase();

                if ((defaultView = ele.ownerDocument.defaultView) && (computedStyle = defaultView.getComputedStyle(ele, null))) {
                    result = computedStyle.getPropertyValue(name);
                    if (result === "" && !$.contains(ele.ownerDocument.documentElement, ele)) {
                        result = dom.style(ele, name);
                    }
                }
                // margin wright is bug in safari

            }
            else if (document.documentElement.currentStyle) {
                //quote from jQuery1.7.2
                var left, rsLeft, uncomputed, tmp;
                name = tools.editCssType(name).name;
                result = ele.currentStyle && ele.currentStyle[name],
			    style = ele.style;

                if (result == null && style && (uncomputed = style[name])) {
                    result = uncomputed;
                }

                // From the awesome hack by Dean Edwards
                // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

                if ($.reg.rnumnonpx.test(result)) {
                    left = style.left;
                    rsLeft = ele.runtimeStyle && ele.runtimeStyle.left;

                    if (rsLeft) {
                        ele.runtimeStyle.left = ele.currentStyle.left;
                    }
                    style.left = name === "fontSize" ? "1em" : result;
                    result = style.pixelLeft + "px";

                    style.left = left;
                    if (rsLeft) {
                        ele.runtimeStyle.left = rsLeft;
                    }
                }
                result = result === "" ? "auto" : result;

            }
            return result;
        }
        , style: function (ele, type, head) {
            /// <summary>返回元素样式表中的某个样式</summary>
            /// <param name="ele" type="Element">element元素</param>
            /// <param name="type" type="String">样式名 缺省返回""</param>
            /// <param name="head" type="String">样式名的头 缺省则无</param>
            /// <returns type="String" />
            var style = ""
            if (type) {
                switch (type) {
                    case "opacity": style = $.getOpacity(ele); break;
                    default: style = dom.styleTable(ele)[$.camelCase(type, head)];

                }
            }
            return style;
        }
        , styleTable: function (ele) {
            /// <summary>返回元素样式表</summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <returns type="Object" />
            var style;
            if (document.defaultView && document.defaultView.getComputedStyle)
                style = document.defaultView.getComputedStyle(ele, null);
            else {
                style = ele.currentStyle;

            }
            return style;
        }

        , clone: function (ele) {
            /// <summary>clone一个新ele</summary>
            /// <param name="ele" type="Element">ele元素</param>
            /// <returns type="Element" />
            return ele.cloneNode(true);
        }
        , contains: function (a, b) {
            /// <summary>quote from jQuery1.7.2</summary>
            /// <param name="a" type="Element">元素a</param>
            /// <param name="b" type="Element">元素b</param>
            /// <returns type="Boolean" />
            /// <private />
            if (document.documentElement.contains) {
                return a !== b && (a.contains ? a.contains(b) : true);

            } else if (document.documentElement.compareDocumentPosition) {
                return !!(a.compareDocumentPosition(b) & 16);
            } else {
                return false;
            }
        }
        , createEle: function (tag) {
            /// <summary>制造一个Dom元素</summary>
            /// <param name="tag" type="String">标签名</param>
            /// <returns type="Element" />
            return document.createElement(tag);
        }

        , getHeight: function (ele) {
            /// <summary>获得元素的高度
            /// </summary>
            //  <param name="ele" type="Element">element元素</param>
            /// <returns type="Number" />
            return dom.curCss(ele, "height") || 0;
        }
        , getHtml: function (ele) {
            /// <summary>获得元素的innerHTML</summary>
            /// <param name="ele" type="Element">element元素</param>
            /// <returns type="String" />
            return ele.innerHTML;
        }
        , getInnerH: function (ele) {
            /// <summary>返回元素的内高度
            /// </summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <returns type="Number" />
            var height = ele.clientHeight
                , top = 0
                , bottom = 0;
            if (!height) {
                height = parseFloat(dom.styleTable(ele)["height"]);
                top = getPosValue(ele, "paddingTop");
                bottom = getPosValue(ele, "paddingBottom");
            }
            return height + top + bottom;
        }
        , getInnerW: function (ele) {
            /// <summary>返回元素的内宽度
            /// </summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <returns type="Number" />
            var width = ele.clientWidth
                , left = 0
                , right = 0;
            if (!width) {
                width = parseFloat(dom.styleTable(ele)["width"]);
                left = getPosValue(ele, "paddingLeft");
                right = getPosValue(ele, "paddingRight");
            }
            return width + left + right;
        }
        , getLastChild: function (ele) {
            /// <summary>获得当前DOM元素的最后个真DOM元素</summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <returns type="Element" />
            var x = ele.lastChild;
            while (x && !$.isEle(x)) {
                x = x.previousSibling;
            }
            return x;
        }
        , getLeft: function (ele) {
            /// <summary>获得元素离左边框的总长度</summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <returns type="Number" />
            var l = ele.offsetLeft || 0, cur = ele.offsetParent;
            while (cur != null) {
                l += cur.offsetLeft;
                cur = cur.offsetParent;
            }
            return l;
        }
        , getOffsetL: function (ele) {
            /// <summary>返回元素的左边距离
            /// <para>left:相对于显示部分</para>
            /// </summary>
            /// <returns type="Number" />
            return $.getOffsetH(ele, "Left");
        }
        , getOffsetT: function (ele) {
            /// <summary>返回元素的顶边距离
            /// <para>top:相对于显示部分</para>
            /// </summary>
            /// <returns type="Number" />
            return $.getOffsetH(ele, "Top");
        }
        , getOpacity: function (ele) {
            /// <summary>获得ele的透明度</summary>
            /// <param name="ele" type="Element">element元素</param>
            /// <returns type="Number" />

            var o;
            if ($.support.opacity) {
                o = $.styleTable(ele)["opacity"];
                if (o == "" || o == undefined) {
                    o = 1;
                }
                else {
                    o = parseFloat(o);
                }
            }
            else {
                //return ele.style.filter ? (ele.style.filter.match(/\d+/)[0] / 100) : 1;
                var f = $.styleTable(ele)["filter"];
                o = 1;
                if (f) {
                    o = f.match(/\d+/)[0] / 100;
                }

            }
            return o;
        }
        , getPageSize: function () {
            /// <summary>返回页面大小
            /// <para>obj.width</para>
            /// <para>obj.height</para>
            /// </summary>
            /// <returns type="Object" />
            var pageH = window.innerHeight, pageW = window.innerWidth;
            if (!$.isNum(pageW)) {
                if (document.compatMode == "CSS1Compat") {
                    pageH = document.documentElement.clientHeight;
                    pageW = document.documentElement.clientWidth;
                }
                else {
                    pageH = document.body.clientHeight;
                    pageW = document.body.clientWidth;
                }
            }
            return { width: pageW, height: pageH };
            //            return {
            //                width: window.innerWidth || document.body.clientWidth || document.body.offsetWidth,
            //                height: window.innerHeight || document.body.clientHeight || document.body.offsetHeight
            //            }
        }
        , getRealChild: function (father, index) {
            /// <summary>通过序号获得当前DOM元素某个真子DOM元素</summary>
            /// <param name="father" type="Element">dom元素</param>
            /// <param name="index" type="Number">序号</param>
            /// <returns type="Element" />
            var i = -1, child;
            var ele = father.firstChild;
            while (ele) {
                if ($.isEle(ele) && ++i == index) {
                    child = ele;
                    break;
                }
                ele = ele.nextSibling;
            }
            return child;
        }
        , getTop: function (ele) {
            /// <summary>获得元素离上边框的总长度</summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <returns type="Number" />
            var t = ele.offsetTop || 0, cur = ele.offsetParent;
            while (cur != null) {
                t += cur.offsetTop;
                cur = cur.offsetParent;
            }
            return t;
        }
        , getOutterH: function (ele, bol) {
            /// <summary>返回元素的外高度
            /// </summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <param name="bol" type="bol">margin是否计算在内</param>
            /// <returns type="Number" />
            var height = ele.offsetHeight, top, bottom, ret;
            if (!height) {
                height = dom.getInnerH(ele);
                top = getPosValue(ele, "borderTopWidth");
                bottom = getPosValue(ele, "borderBottomWidth");
                height += top + bottom;
            }
            if (bol) {
                top = getPosValue(ele, "marginTop");
                bottom = getPosValue(ele, "marginBottom");
                height += top + bottom;
            }
            return height;
        }
        , getOutterW: function (ele, bol) {
            /// <summary>返回元素的外宽度
            /// </summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <param name="bol" type="bol">margin是否计算在内</param>
            /// <returns type="Number" />
            var width = ele.offsetWidth, left, right, ret;
            if (!width) {
                width = dom.getInnerW(ele);
                left = getPosValue(ele, "borderLeftWidth");
                right = getPosValue(ele, "borderRightWidth");
                width += left + right;
            }
            if (bol) {
                left = getPosValue(ele, "marginLeft");
                right = getPosValue(ele, "marginRight");
                if (!left) {
                    ret = $.curCss(ele, "margin").split(" ");
                    left = parseFloat(ret[0] || 0);
                    right = parseFloat(ret[2] || 0);
                }
                width += left + right;
            }
            return width;
        }
        , getWidth: function (ele) {
            /// <summary>获得元素的宽度
            /// </summary>
            //  <param name="ele" type="Element">element元素</param>
            /// <returns type="Number" />
            return dom.curCss(ele, "width") || 0;
        }

        , hide: function (ele, visible) {
            /// <summary>隐藏元素</summary>
            /// <param name="ele" type="Element">element元素</param>
            /// <param name="visible" type="Boolean">true:隐藏后任然占据文档流中</param>
            /// <returns type="self" />
            if (visible) {
                ele.style.visibility = "hidden";
            }
            else {
                ele.style.dispaly && $.data(ele, "_visible_display", ele.style.dispaly);
                ele.style.display = "none";
            }

            //a ? this.css({ vi: 'hidden' }) : this.css({ d: 'none' })
            return this;
        }

        , isVisible: function (ele) {
            /// <summary>返回元素是否可见</summary>
            /// <param name="ele" type="Element">element元素</param>
            /// <returns type="Boolean" />
            var t = $.styleTable(ele);
            if (t["display"] == "none") {
                return false;
            }
            if (t["visibility"] == "hidden") {
                return false;
            }
            return true;
        }
        , iterationChild: function (ele, fun) {
            /// <summary>遍历当前元素的所有子元素并返回符合function条件的DOM元素集合</summary>
            /// <param name="ele" type="Element">DOM元素</param>
            /// <param name="fun" type="Function">筛选的方法</param>
            /// <returns type="Array" />
            return $.filter(function (child) {
                return fun(child);
            }, $.children(ele));
            //return list.length > 0 ? list : null;
        }

        , position: function (ele) {
            /// <summary>返回元素的位置及大小;值都是offset
            /// <para>top:相对于父级</para>
            /// <para>left:相对于父级</para>
            /// <para>width:相对于显示部分</para>
            /// <para>height:相对于显示部分</para>
            /// <para>pageTop:相对于dom</para>
            /// <para>pageLeft:相对于dom</para>
            /// <para>scrollWidth:相对于整个大小</para>
            /// <para>scrollHeight:相对于整个大小</para>
            /// </summary>
            /// <returns type="Object" />
            var h = ele.offsetHeight || ele.clientHeight, w = ele.offsetWidth || ele.clientWidth;
            return {
                top: ele.offsetTop,
                left: ele.offsetLeft,
                height: h,
                width: w,
                scrollHeight: Math.max(ele.scrollHeight, h),
                scrollWidth: Math.max(ele.scrollWidth, w),
                pageLeft: $.getLeft(ele),
                pageTop: $.getTop(ele)
            }

        }

        , remove: function (ele) {
            /// <summary>把元素从文档流里移除</summary>
            /// <param name="ele" type="Object">对象</param>
            /// <param name="isDelete" type="Boolean">是否彻底删除</param>
            /// <returns type="self" />
            ele.parentNode.removeChild(ele);
            if ($.client.browser.ie <= 8) {
                ele = null;
            }
            return this;
        }
        , removeChild: function (ele, child) {
            /// <summary>删除子元素</summary>
            /// <param name="ele" type="Element"></param>
            /// <param name="child" type="Element"></param>
            /// <returns type="self" />
            ele.removeChild(child)
            return this;
        }
        , removeChildren: function (ele) {
            /// <summary>删除所有子元素</summary>
            /// <param name="ele" type="Element"></param>
            /// <returns type="self" />
            for (var i = ele.childNodes.length - 1; i >= 0; i--) {
                $.removeChild(ele, ele.childNodes[i]);
            }
            return this;
        }

        , setHeight: function (ele, value) {
            /// <summary>设置元素的高度
            /// </summary>
            /// <param name="ele" type="Element">element元素</param>
            /// <param name="value" type="Number/String">值</param>
            /// <returns type="self" />
            var e = $.getValueAndUnit(value);
            ele.style.height = e.value + (e.unit || "px");
            return this;
        }
        , setHtml: function (ele, str, bool) {
            /// <summary>设置元素的innerHTML
            /// <para>IE678的的select.innerHTML("<option></option>")存在问题</para>
            /// <para>bool为true相当于+=这样做是有风险的，除了IE678外的浏览器会重置为过去的文档流</para>
            /// </summary>
            /// <param name="ele" type="Element">element元素</param>
            /// <param name="str" type="String">缺省 则返回innerHTML</param>
            /// <param name="bool" type="Boolean">true添加 false覆盖</param>
            /// <returns type="self" />
            if (bool == true) {
                ele.innerHTML += str;
            }
            else {
                ele.innerHTML = str;
            }
            return this;
        }
        , setInterval: function (fun, delay, context) {
            /// <summary>绑定作用域的Interval一样会返回一个ID以便clear</summary>
            /// <param name="fun" type="Function">方法</param>
            /// <param name="delay" type="Number">时间毫秒为单位</param>
            /// <param name="context" type="Object">作用域缺省为winodw</param>
            /// <returns type="Number" />
            return setInterval($.bind(fun, context), delay)
        }
        , setOpacity: function (ele, alpha) {
            /// <summary>改变ele的透明度
            /// </summary>
            /// <param name="ele" type="Element">element元素</param>
            /// <param name="alpha" type="Number">0-1</param>
            /// <returns type="self" />
            alpha = $.between(0, 1, alpha);
            if ($.client.browser.ie678)
                ele.style.filter = 'Alpha(opacity=' + (alpha * 100) + ')'; //progid:DXImageTransform.Microsoft.
            else
                ele.style.opacity = alpha;
            return this;

        }
        , setInnerH: function (ele, height) {
            /// <summary>设置元素的内高度
            /// <para>height:相对于显示部分</para>
            /// </summary>
            /// <param name="ele" type="Element">element元素</param>
            /// <param name="height" type="Number/String">值</param>
            /// <returns type="self" />
            var diffH = getPosValue(ele, "paddingTop") + getPosValue(ele, "paddingBottom")
                , e = $.getValueAndUnit(height), clientH = ele.clientHeight, display = dom.curCss(ele, "display");

            ele.style.height = e.value + (e.unit || "px");
            if (!clientH) {
                if (display == "none" || display.indexOf("inline") > -1) {
                    ele.style.display = "block";
                    clientH = ele.clientHeight;
                }
                if (!ele.parentNode) {
                    document.body.appendChild(ele);
                    clientH = ele.clientHeight;
                    document.body.removeChild(ele);
                }
                ele.style.display = display;
            }
            else {
                clientH = ele.clientHeight;
            }
            ele.style.height = Math.max(clientH - diffH - diffH, 0) + "px";
            return this;
        }
        , setInnerW: function (ele, width) {
            /// <summary>设置元素的内宽度
            /// <para>width:相对于显示部分</para>
            /// </summary>
            /// <param name="ele" type="Element">element元素</param>
            /// <param name="width" type="Number/String">值</param>
            /// <returns type="self" />
            var diffW = getPosValue(ele, "paddingLeft") + getPosValue(ele, "paddingRight")
                , e = $.getValueAndUnit(width), clientW = ele.clientWidth, display = dom.curCss(ele, "display");

            ele.style.width = e.value + (e.unit || "px");
            if (!clientW) {
                if (display == "none" || display.indexOf("inline") > -1) {
                    ele.style.display = "block";
                    clientW = ele.clientWidth;
                }
                if (!ele.parentNode) {
                    document.body.appendChild(ele);
                    clientW = ele.clientWidth;
                    document.body.removeChild(ele);
                }
                ele.style.display = display;
            }
            else {
                clientW = ele.clientWidth;
            }
            ele.style.width = Math.max(clientW - diffW - diffW, 0) + "px";
            return this;
        }
        , setOffsetL: function (ele, left) {
            /// <summary>设置元素左边距
            /// <para>left:相对于显示部分</para>
            /// <para>单位默认为px</para>
            /// </summary>
            /// <param name="ele" type="Element">element元素</param>
            /// <param name="left" type="Number/String/undefined">值 可缺省 缺省则返回</param>
            /// <returns type="self" />
            var type = arguments[2] || "Left", lower = type.toLowerCase();
            if ($.isNum(left)) {
                ele.style[lower] = left + "px";
            }
            else if ($.isStr(left)) {
                ele.style[lower] = left;
            }
            return this;
        }
        , setOffsetT: function (ele, top) {
            /// <summary>设置元素左边距
            /// <para>left:相对于显示部分</para>
            /// <para>单位默认为px</para>
            /// </summary>
            /// <param name="ele" type="Element">element元素</param>
            /// <param name="left" type="Number/String/undefined">值 可缺省 缺省则返回</param>
            /// <returns type="self" />
            return $.setOffsetL(ele, top, "Top");
        }
        , setOutterH: function (ele, height, bol) {
            /// <summary>设置元素的外高度
            /// </summary>
            /// <param name="ele" type="Element">element元素</param>
            /// <param name="height" type="Number/String">值</param>
            /// <param name="bol" type="Boolean">是否包括margin</param>
            /// <returns type="self" />
            var diffH = getPosValue(ele, "borderTopWidth") + getPosValue(ele, "borderBottomWidth")
                , marginH = 0
                , e = $.getValueAndUnit(height), offsetH = ele.offsetHeight, display = dom.curCss(ele, "display");
            if (bol) {
                marginH = getPosValue(ele, "marginTop") + getPosValue(ele, "marginBottom");
            }
            ele.style.height = e.value + (e.unit || "px");
            if (!offsetH) {
                if (display == "none" || display.indexOf("inline") > -1) {
                    ele.style.display = "block";
                    offsetH = ele.offsetHeight;
                }
                if (!ele.parentNode) {
                    document.body.appendChild(ele);
                    offsetH = ele.offsetHeight;
                    document.body.removeChild(ele);
                }
                ele.style.display = display;
            }
            else {
                offsetH = ele.offsetHeight;
            }
            ele.style.height = Math.max(offsetH - diffH - diffH - marginH, 0) + "px";
            return this;
        }
        , setOutterW: function (ele, width, bol) {
            /// <summary>设置元素的外宽度
            /// </summary>
            /// <param name="ele" type="Element">element元素</param>
            /// <param name="width" type="Number/String">值</param>
            /// <param name="bol" type="Boolean">是否包括margin</param>
            /// <returns type="self" />
            var diffW = getPosValue(ele, "borderLeftWidth") + getPosValue(ele, "borderRightWidth")
                , marginW = 0
                , e = $.getValueAndUnit(width), offsetW = ele.offsetWidth, display = dom.curCss(ele, "display");
            if (bol) {
                diffW += getPosValue(ele, "marginLeft") + getPosValue(ele, "marginRight");
            }
            ele.style.width = e.value + (e.unit || "px");
            if (!offsetW) {
                if (display == "none" || display.indexOf("inline") > -1) {
                    ele.style.display = "block";
                    offsetW = ele.offsetWidth;
                }
                if (!ele.parentNode) {
                    document.body.appendChild(ele);
                    offsetW = ele.offsetWidth;
                    document.body.removeChild(ele);
                }
                ele.style.display = display;
            }
            else {
                offsetW = ele.offsetWidth;
            }
            ele.style.width = Math.max(offsetW - diffW - diffW - marginW, 0) + "px";
            return this;
        }
        , show: function (ele) {
            /// <summary>显示元素</summary>
            /// <param name="ele" type="Element">element元素</param>
            /// <returns type="self" />
            var s = ele.style
            , n = "none", h = "hidden", nEle, v;
            if ($.curCss(ele, "display") == n) {
                v = $.data(ele, "_visible_display");
                if (!v) {
                    nEle = $.createEle(ele.tagName);
                    if (ele.parentNode) {
                        document.body.appendChild(nEle);
                    }
                    v = $.curCss(nEle, "display") || "";
                    document.body.removeChild(nEle);
                    nEle = null;
                }

                s.display = v;
            }
            if ($.curCss(ele, "visibility") == h) {
                s.visibility = 'visible';
            }

            return this;
        }
        , setWidth: function (ele, value) {
            /// <summary>设置元素的宽度
            /// </summary>
            /// <param name="ele" type="Element">element元素</param>
            /// <param name="value" type="Number/String">值</param>
            /// <returns type="self" />
            var e = $.getValueAndUnit(value);
            ele.style.width = e.value + (e.unit || "px");
            return this;
        }
    };

    $.extend(dom);

    $.fn.extend({
        css: function (style, value) {
            /// <summary>添加或获得样式
            /// <para>如果要获得样式 返回为String</para>
            /// <para>fireFox10有个问题，请不要写成带-的形式</para>
            /// <para>$().css({b:"yellow"});$().css("b","yellow")</para>
            /// </summary>
            /// <param name="style" type="Object/String">obj为赋样式 str为获得一个样式</param>
            /// <param name="value" type="String/Number/undefined">当style是字符串，并且value存在</param>
            /// <returns type="self" />
            var b = style, result, tmp; //, isEdit = arguments[1] === false ? false : true;
            //if (!style) { }
            if ($.isObj(b)) {
                for (var i in b) {
                    result = tools.editCssType.call(this, i);
                    this.each(function (ele) {
                        if ($.isFun(result.name))
                            result.name.call(this, b[i]);
                        else
                            result.name && (ele.style[result.name] = b[i] + result.unit);
                    });
                }
            }
            else if ($.isStr(b)) {
                result = tools.editCssType.call(this, b);
                if (value === undefined) {
                    if ($.isFun(result.name))
                        return result.name.call(this);
                    else
                        return this[0].style[result.name];

                }
                else {
                    this.each(function (ele) {
                        if ($.isFun(result.name))
                            result.name.call(this, value);
                        else
                            result.name && (ele.style[result.name] = value + result.unit);
                    });
                }
            }
            return this;
        }
        , curCss: function (name) {
            /// <summary>返回样式原始值 可能有bug</summary>
            /// <param name="name" type="String">样式名</param>
            /// <returns type="any" />
            return $.curCss(this[0], name);
        }
        , style: function (type, head) {
            /// <summary>返回第一个元素样式表中的某个样式</summary>
            /// <param name="type" type="String">样式名 缺省返回""</param>
            /// <param name="head" type="String">样式名的头 缺省则无</param>
            /// <returns type="String" />

            return $.style(this[0], type, head);
        }
        , styleTable: function (ele) {
            /// <summary>返回第一个元素样式表</summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <returns type="Object" />
            return $.styleTable(this[0]);
        }

        , antonymVisible: function (a) {
            /// <summary>添加兼容滚轮事件</summary>
            /// <param name="a" type="Boolean">如果隐藏，隐藏的种类，true表示任然占据文档流</param>
            /// <returns type="self" />
            if (this.isVisible())
                this.hide(a);
            else
                this.show();
            return this;
        }
        , append: function (child) {
            /// <summary>为$的第一个元素添加子元素
            /// <para>字符串是标签名:div</para>
            /// <para>DOM元素</para>
            /// <para>若为$，则为此$第一个元素添加另一个$的所有元素</para>
            /// <para>也可以为这种形式："<span></span><input/>"</para>
            /// <para>select去append("<option></option>")存在问题</para>
            /// <para>$({ i:"abc" }, "option")可以以这样方式实现</para>
            /// </summary>
            /// <param name="child" type="String/Element/$">子元素类型</param>
            /// <returns type="self" />
            var a = null, c = child, fun = arguments[1] || "appendChild", ele = this.eles[0];
            if (!c)
                return this;
            if ($.isStr(c)) {
                var str, div;
                str = c.match(/^<\w.+[\/>|<\/\w.>]$/);
                if (str) {
                    c = str[0];
                    this.each(function (ele) {
                        div = document.createElement("div");
                        div.innerHTML = c;
                        ele[fun](div.childNodes[0]);
                        //delete div;
                    });
                }
            }
            //this.html(c, true);
            else if ($.isEle(c) || c.nodeType === 3 || c.nodeType === 8)
                ele[fun](c);
            else if ($.is$(c)) {
                c.each(function (son) {
                    ele[fun](son);
                });
            }
            return this;
        }
        , appendTo: function (father) {
            /// <summary>添加当前的$所有元素到最前面
            /// <para>father为$添加的目标为第一个子元素</para>
            /// <para>father为ele则目标就是father</para>
            /// </summary>
            /// <param name="father" type="Element/$">父元素类型</param>
            /// <returns type="self" />
            var a = null, f = father, fun = arguments[1] || "appendChild";
            if ($.isEle(f)) a = [f];
            else if ($.is$(f)) a = f.eles;
            if (a)
                $.each(a, function (ele) {
                    this.each(function (child) {
                        ele[fun](child);
                    });
                    return false;
                }, this);
            return this;
        }

        , child: function (query, real) {
            /// <summary>返回当前对象的所有一级子元素</summary>
            /// <param name="str" type="String">字符串query</param>
            /// <param name="real" type="Boolean/Null">是否获得真元素，默认为真</param>
            /// <returns type="self" />
            if ($.isStr(query)) {
                var child = $.child(this.eles, real === undefined ? true : real);
                child = $.query(query, child);
            }
            else {
                var child = $.child(this.eles, query === undefined ? true : real);
            }
            return $(child);
        }
        , children: function (query) {
            /// <summary>返回当前对象的所有子元素</summary>
            /// <param name="str" type="String">字符串query</param>
            /// <param name="real" type="Boolean/Null">是否获得真元素，默认为真</param>
            /// <returns type="self" />
            var children = $.children(this.eles);
            if ($.isStr(query)) children = $.query(query, children);
            return $(children);
        }
        , clone: function () {
            /// <summary>clone一个新$</summary>
            /// <returns type="self" />
            var eles = [];
            this.each(function (ele) {
                eles.push($.clone(ele));
            });
            return $(eles);
        }

        , getLeft: function () {
            /// <summary>获得第一个元素离左边框的总长度
            /// <para>left:相对于父级</para>
            /// </summary>
            /// <returns type="Number" />
            return $.getLeft(this[0]);
        }
        , getTop: function () {
            /// <summary>获得第一个元素离上边框的总长度
            /// <para>left:相对于父级</para>
            /// </summary>
            /// <returns type="Number" />
            return $.getTop(this[0]);
        }

        , height: function (height) {
            /// <summary>返回或设置第一个元素的高度
            /// </summary>
            /// <param name="height" type="Number">高度</param>
            /// <returns type="Number" />
            return $.isEmpty(height)
            ? parseFloat($.getHeight(this[0]))
            : this.each(function (ele) {
                $.setHeight(ele, height);
            });
        }
        , html: function (str, bool) {
            /// <summary>设置所有元素的innerHTML或返回第一元素的innerHTML
            /// <para>IE678的的select.innerHTML("<option></option>")存在问题</para>
            /// <para>$({ i:"abc" }, "option")可以以这样方式实现</para>
            /// <para>为true相当于+=这样做是有风险的，除了IE678外的浏览器会重置为过去的文档流</para>
            /// <para>获得时返回String</para>
            /// </summary>
            /// <param name="str" type="String">缺省 则返回innerHTML</param>
            /// <param name="bool" type="Boolean">true添加 false覆盖</param>
            /// <returns type="self" />
            return $.isStr(str) ?

            this.each(function (ele, bool) {
                $.each($.children(ele), function (child) {
                    $.removeData(child);
                    $.remove(child);
                    //移除事件
                });
                $.setHtml(ele, str, bool);
            })

            : $.getHtml(this[0]);
        }
        , hide: function (visible) {
            /// <summary>设置所有元素隐藏</summary>
            /// <param name="visible" type="Boolean">true:隐藏后任然占据文档流中</param>
            /// <returns type="self" />
            //            a ? this.css({ vi: 'hidden' }) : this.css({ d: 'none' })
            //            return this;
            return this.each(function (ele) {
                $.hide(ele, visible);
            })
        }

        , innerH: function (height) {
            /// <summary>返回或设置第一个元素内高度
            /// </summary>
            /// <param name="height" type="Number">高度</param>
            /// <returns type="Number" />
            return !$.isEmpty(height)
            ? this.each(function (ele) {
                $.setInnerH(ele, height);
            }) : $.getInnerH(this[0]);
        }
        , innerW: function (width) {
            /// <summary>返回第一个元素内宽度
            /// </summary>
            /// <param name="height" type="Number">宽度</param>
            /// <returns type="Number" />
            return !$.isEmpty(width)
            ? this.each(function (ele) {
                $.setInnerW(ele, width);
            }) : $.getInnerW(this[0]);
        }
        , insertBefore: function (child) {
            /// <summary>为$的第一个元素最前面加入子元素
            /// <para>字符串是标签名:div</para>
            /// <para>DOM元素</para>
            /// <para>若为$，则为此$第一个元素添加另一个$的所有元素</para>
            /// <para>也可以为这种形式：<span><span/><input /></para>
            /// <para>select去append("<option></option>")存在问题</para>
            /// <para>$({ i:"abc" }, "option")可以以这样方式实现</para>
            /// </summary>
            /// <param name="child" type="String/Element/$">子元素类型</param>
            /// <returns type="self" />
            return this.append(child, "insertBefore");
        }
        , insertBeforeTo: function (father) {
            /// <summary>添加当前的$所有元素到最前面
            /// <para>father为$添加的目标为第一个子元素</para>
            /// <para>father为ele则目标就是father</para>
            /// </summary>
            /// <param name="father" type="Element/$">父元素类型</param>
            /// <returns type="self" />
            return this.appendTo(father, "insertBefore");
        }
        , insertText: function (str) {
            /// <summary>给当前对象的所有ele插入TextNode</summary>
            /// <param name="str" type="String">字符串</param>
            /// <returns type="self" />
            if ($.isStr(str) && str.length > 0) {
                var nodeText;
                this.each(function (ele) {
                    nodeText = document.createTextNode(str);
                    ele.appendChild(nodeText);
                });
            }
            return this;
        }
        , isVisible: function () {
            /// <summary>返回元素是否可见</summary>
            /// <returns type="Boolean" />
            //            if (this.css('visibility') == 'hidden')
            //                return false;
            //            if (this.css('d') == 'none')
            //                return false;
            // return true;
            return $.isVisible(this[0]);
        }

        , offsetL: function (left) {
            /// <summary>获得或设置元素left
            /// <para>为数字时则返回this 设置left</para>
            /// <para>单位默认为px</para>
            /// </summary>
            /// <param name="left" type="num/any">宽度</param>
            /// <returns type="self" />
            return left
            ? this.each(function (ele) {
                $.setOffsetL(ele, left);
            }) : $.getOffsetL(this[0]);
        }
        , offsetT: function (top) {
            /// <summary>获得或设置元素top
            /// <para>为数字时则返回this 设置top</para>
            /// <para>单位默认为px</para>
            /// </summary>
            /// <param name="top" type="num/any">宽度</param>
            /// <returns type="self" />
            return top
            ? this.each(function (ele) {
                $.setOffsetT(ele, top);
            }) : $.getOffsetT(this[0]);
        }
        , opacity: function (alpha) {
            /// <summary>设置当前对象所有元素的透明度或获取当前对象第一个元素的透明度
            /// <para>获得时返回Number</para>
            /// </summary>
            /// <param name="alpha" type="Number/null">透明度（0~1）可选，为空为获取透明度</param>
            /// <returns type="self" />
            return $.isNum(alpha)
            ? this.each(function (ele) {
                $.setOpacity(ele, alpha)
            })
            : $.getOpacity(this[0]);
        }
        , outerH: function (height, bol) {
            /// <summary>返回或设置第一个元素的外高度
            /// </summary>
            /// <param name="height" type="Number">高度</param>
            /// <param name="bol" type="bol">margin是否计算在内</param>
            /// <returns type="Number" />
            if (arguments.length == 1 && $.isBol(height)) {
                bol = height;
                height = null;
            }
            return $.isEmpty(height)
            ? $.getOutterH(this[0], bol)
            : this.each(function (ele) {
                $.setOutterH(ele, height, bol);
            })
        }
        , outerW: function (width, bol) {
            /// <summary>返回或设置第一个元素的外宽度
            /// </summary>
            /// <param name="width" type="Number">宽度</param>
            /// <returns type="Number" />
            if (arguments.length == 1 && $.isBol(width)) {
                bol = width;
                width = null;
            }
            return $.isEmpty(width)
            ? $.getOutterW(this[0], bol)
            : this.each(function (ele) {
                $.setOutterW(ele, width, bol);
            });
        }

        , position: function () {
            /// <summary>返回第一个元素的位置及大小;值都是offset
            /// <para>top:相对于父级</para>
            /// <para>left:相对于父级</para>
            /// <para>width:相对于显示部分</para>
            /// <para>height:相对于显示部分</para>
            /// <para>Top:相对于dom</para>
            /// <para>Left:相对于dom</para>
            /// <para>Width:相对于整个大小</para>
            /// <para>Height:相对于整个大小</para>
            /// </summary>
            /// <returns type="Object" />
            return $.position(this[0]);
        }

        , remove: function () {
            /// <summary>把所有元素从文档流里移除并且移除所有子元素</summary>
            /// <returns type="self" />
            return this.each(function (ele) {
                //移除事件
                $.each($.children(ele), function (child) {
                    $.removeData(child);
                    //移除事件
                });
                $.removeData(ele);
                $.remove(ele);
            });
        }
        , removeChild: function (child) {
            /// <summary>删除某个子元素</summary>
            /// <param name="child" type="Number/Element/$"></param>
            /// <returns type="self" />
            var temp;
            if ($.isNum(child))
                this.each(function (ele) {
                    temp = $.getRealChild(ele, child);
                    $.removeData(temp);
                    ele.removeChild(temp);
                    //移除事件
                });
            else if ($.isEle(child)) {
                try {
                    $.removeData(child);
                    this.eles[0].removeChild(child);
                    //移除事件
                } catch (e) { }
            }
            else if ($.is$(child))
                this.each(function (ele) {
                    child.each(function (son) {
                        try {
                            $.removeData(son);
                            ele.removeChild(son);
                            //移除事件
                        } catch (e) { }
                    });
                });
            return this;
        }
        , removeChildren: function () {
            /// <summary>删除所有子元素</summary>
            /// <param name="child" type="Number/Element/$"></param>
            /// <returns type="self" />
            $.each($.children(this.eles), function (ele) {
                $.removeData(ele);
                //移除事件
            });
            return this.each(function (ele) {
                $.removeChildren(ele);
            });
        }
        , replace: function (newChild) {
            /// <summary>把所有元素替换成新元素</summary>
            /// <param name="newChild" type="Element/$">要替换的元素</param>
            /// <returns type="self" />
            var father;
            if ($.isEle(newChild)) {
                this.each(function (ele) {
                    father = ele.parentNode;
                    try {
                        father.replaceChild(newChild, ele);
                        $.removeData(ele);
                        //移除事件
                        return false;
                    } catch (e) { }
                });
            }
            else if ($.is$(newChild)) {
                this.each(function (ele1) {
                    father = ele1.parentNode;
                    newChild.each(function (ele2) {
                        try {
                            father.replaceChild(ele2, ele1);
                            father.appendChild(ele2);
                            $.removeData(ele1);
                            //移除事件
                        } catch (e) { }
                    });
                });
            }
            return this;
        }
        , replaceChild: function (newChild, child) {
            /// <summary>替换子元素</summary>
            /// <param name="newChild" type="Element">新元素</param>
            /// <param name="child" type="Element">要替换的元素</param>
            /// <returns type="self" />
            newChild = $.getEle(newChild);
            var temp;
            $.each(newChild, function (newNode) {
                if ($.isNum(child))
                    this.each(function (ele) {
                        try {
                            temp = $.getRealChild(ele, child);
                            ele.replaceChild(newNode, temp);
                            $.removeData(temp);
                            //移除事件
                            return false;
                        } catch (e) { }
                    });
                else if ($.isEle(child))
                    this.each(function (ele) {
                        try {
                            ele.replaceChild(newNode, child);
                            $.removeData(child);
                            //移除事件
                            return false;
                        } catch (e) { }
                    });
                else if ($.is$(child))
                    this.each(function (ele) {
                        child.each(function (son) {
                            try {
                                ele.replaceChild(newNode, son);
                                $.removeData(son);
                                //移除事件
                                return false;
                            } catch (e) { }
                        });
                    });
            }, this);
            return this;
        }

        , scrollHeight: function () {
            /// <summary>返回第一个元素的高度
            /// <para>Height:相对于整个大小</para>
            /// </summary>
            /// <returns type="Number" />
            return this[0].scrollHeight || 0;
        }
        , scrollWidth: function () {
            /// <summary>返回第一个元素的宽度
            /// <para>Width:相对于整个大小</para>
            /// </summary>
            /// <returns type="Number" />
            return this[0].scrollWidth || 0;
        }

        , show: function () {
            /// <summary>显示所有元素</summary>
            /// <returns type="self" />
            //            if (this.css('visibility') == 'hidden')
            //                this.css({ vi: 'visible' });
            //            else if (this.css('d') == 'none')
            //                this.css({ d: '' });
            //            return this;
            return this.each(function (ele) {
                $.show(ele);
            });
        }

        , width: function (width) {
            /// <summary>返回或设置第一个元素的宽度
            /// </summary>
            /// <param name="width" type="Number">宽度</param>
            /// <returns type="Number" />
            return $.isEmpty(width)
            ? parseFloat($.getWidth(this[0]))
            : this.each(function (ele) {
                $.setWidth(ele, width);
            });
        }
    });

    return dom;
});
