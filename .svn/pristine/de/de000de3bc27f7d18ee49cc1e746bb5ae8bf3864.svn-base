/// <reference path="../myquery.js" />

myQuery.define("main/class", function ($, undefined) {
    "use strict"; //启用严格模式
    var Class = {
        addClass: function (ele, className) {
            /// <summary>给DOM元素添加样式表</summary>
            /// <param name="ele" type="Element">ele元素</param>
            /// <param name="className" type="String">样式表</param>
            /// <returns type="self" />
            if (!$.getClass(ele, className)) {
                var str = " ";
                if (ele.className.length == 0)
                    str = "";
                ele.className += str + className;
            }
        }

        , getClass: function (ele, className) {
            /// <summary>获得指定的DOM元素的样式名</summary>
            /// <param name="ele" type="Element">dom元素</param>
            /// <param name="className" type="String">样式名</param>
            /// <returns type="String" />
            var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
                , result = ele.className.match(reg)
            return (result && result[0]) || "";
        }
        , removeClass: function (ele, className) {
            /// <summary>对元素删除一个样式类</summary>
            /// <param name="ele" type="Object">对象</param>
            /// <param name="className" type="String">样式名</param>
            /// <returns type="self" />
            if ($.getClass(ele, className)) {
                var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
                ele.className = ele.className.replace(reg, ' ');
            }
            return this;
        }
        , replaceClass: function (ele, oldClassName, newClassName) {
            /// <summary>清空所有样式表</summary>
            /// <param name="ele" type="Element">ele元素</param>
            /// <param name="className" type="String">替换整个样式表 缺省为空</param>
            /// <returns type="self" />
            oldClassName && (ele.className = ele.className.replace(oldClassName, newClassName));
            return this;
        }

    };

    $.extend(Class);

    $.fn.extend({
        addClass: function (className) {
            /// <summary>给所有DOM元素添加样式表</summary>
            /// <param name="className" type="String">样式表</param>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.addClass(ele, className);
            }, this);
        }
        , getClass: function (className) {
            /// <summary>第一个元素是否有个样式名</summary>
            /// <param name="className" type="String">样式名</param>
            /// <returns type="String" />
            return $.getClass(this[0], className);
        }
        , removeClass: function (className) {
            /// <summary>对所有元素删除一个样式类</summary>
            /// <param name="className" type="String">样式名</param>
            /// <returns type="self" />
            return this.each(function (ele) {
                $.removeClass(ele, className);
            });
        }
        , replaceClass: function (oldClassName, newClassName) {
            /// <summary>替换元素所有样式</summary>
            /// <param name="className" type="String">样式名</param>
            /// <returns type="self" />
            this.each(function (ele) {
                $.replaceClass(ele, oldClassName, newClassName);
            });
            return this;
        }
    });

    return Class;
});
