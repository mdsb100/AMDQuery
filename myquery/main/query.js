myQuery.define("main/query", ["lib/sizzle", "main/attr"], function ($, Sizzle, attr, undefined) {
    "use strict"; //启用严格模式

    $.module["lib/sizzle"] = "Sizzle1.10.3";

    var core_deletedIds = [],
    core_concat = core_deletedIds.concat;

    var runtil = /Until$/,
        rparentsprev = /^(?:parents|prev(?:Until|All))/,
        isSimple = /^.[^:#\[\.,]*$/,
        rneedsContext = Sizzle.selectors.match.needsContext,
        // methods guaranteed to produce a unique set when starting from a unique set
        guaranteedUnique = {
            children: true,
            contents: true,
            next: true,
            prev: true
        };

    var rId = $.reg.id,
        rTagName = /^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/,
        rCss = /^\.((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
        rProperty = /^\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/

    var reg = RegExp,
        propertyFun = {
            "default": function (item, value) { return item !== undefined; }
            , "=": function (item, value) { return item == value; }
            , "!=": function (item, value) { return item != value; }
            , "^=": function (item, value) {
                return item != undefined && item.toString().indexOf(value.toString()) == 0;
            }
            , "*=": function (item, value) {
                return item != undefined && item.indexOf(value.toString()) > -1;

            }
            , "$=": function (item, value) {
                if (item != undefined) {
                    item = item.toString(); ;
                    value = value.toString();
                    var ret = item.indexOf(value.toString());
                    return ret > -1 && item.length - value.length == ret
                }
                return false
            }
        },
        query = {
            expr : Sizzle.selectors,
            unique : Sizzle.uniqueSort,
            text : Sizzle.getText,

            dir: function( ele, dir, until ) {
                var matched = [],
                  cur = ele[ dir ];

                while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !$( cur ).is( until )) ) {
                  if ( cur.nodeType === 1 ) {
                    matched.push( cur );
                  }
                  cur = cur[dir];
                }
                return matched;
            },

            posterity: function (eles) {
                /// <summary>获得所有的子元素</summary>
                /// <param name="eles" type="Element/ElementCollection/arr">从元素或元素数组或元素集合中获取</param>
                /// <param name="real" type="Boolean/Null">是否获得真元素，默认为真</param>
                /// <returns type="Array" />
                if ($.isEle(eles))
                    eles = [eles];
                return $.getEleByTag("*", eles); ;
            },

            elementCollectionToArray: function (eles, real) {
                /// <summary>把ElementCollection转换成arr[ele]</summary>
                /// <param name="eles" type="ElementCollection">元素集合</param>
                /// <param name="real" type="Boolean/undefined">是否获得真元素，默认为真</param>
                /// <returns type="Array" />
                var list = [];
                if ($.isEleConllection(eles)) {
                    var real = real === undefined ? true : real;
                    $.each(eles, function (ele) {
                        if (real === false)
                            list.push(ele)
                        else if (ele.nodeType != 3 && ele.nodeType != 8)
                            list.push(ele)
                    }, this);
                }
                return list;
            },

            find: function (str, eles) {
                /// <summary>查询命令
                /// <para>arr返回元素数组</para>
                /// </summary>
                /// <param name="str" type="String">字符串query</param>
                /// <param name="eles" type="Element/ElementCollection/Array[Element]">查询范围</param>
                /// <returns type="Array" />
                if (!eles || (eles.length != undefined && eles.length < 1)) return [];
                if (!str) {
                    return $.filter("same", eles);
                }
                var list;
                // 严格模式 无法调用 arguments.callee
                if (/,/.test(str)) {
                    list = [];
                    for (var i = 0, querys = str.split(","); i < querys.length; i++) {
                        querys[i] && (list = list.concat($.query(querys[i], eles)));
                    }
                    return $.find("", list);
                }
                else if (rId.test(str)) {
                    var result = $.getEleById(reg.$1, eles.ownerDocument || eles[0].ownerDocument || document);
                    result && (list = [result]);
                }
                else if (rTagName.test(str)) {
                    list = $.getEleByTag(reg.$1, eles);
                }
                else if (rCss.test(str)) {
                    list = $.getEleByClass(reg.$1, eles);
                }
                else if (/^>/.test(str)) {
                    list = $.search(reg.rightContext, eles, true);
                }
                else if (/^\s/.test(str)) {
                    list = $.query(reg.rightContext, eles, true);
                }
                else if (/^:/.test(str)) {
                    list = $.filter(reg.rightContext, eles, true);
                }
                else if (rProperty.test(str)) {
                    list = $.property(str, eles);
                }
                else if (/^(\+\%)/.test(str)) {
                    list = $.nextAll(eles);
                }
                else if (/^(\~\%)/.test(str)) {
                    list = $.preAll(eles);
                }
                else if (/^\+/.test(str)) {
                    list = $.next(eles);
                }
                else if (/^\~/.test(str)) {
                    list = $.pre(eles);
                }
                //                else if (/^,/.test(str)) {
                //                    !$.isArr(eles) && (eles = [eles])
                //                    return eles.concat(this.query(reg.rightContext, (eles[0].ownerDocument && eles[0].ownerDocument.documentElement) || document.documentElement));
                //                }
                return $.find(reg.rightContext, list);
            },
            filter: function (str, eles) {
                /// <summary>筛选Element；也可以用来筛选一般数组
                /// <para>返回ele数组</para>
                /// </summary>
                /// <param name="str" type="String/Function">字符串query或者筛选方法</param>
                /// <param name="eles" type="$/Array/Array:[Element]/Element/ElementCollection">筛选范围</param>
                /// <returns type="Array" />
                var num, list = [];
                if (!str || !eles) {
                    return list;
                }
                else if ($.isFun(str)) {
                    //                    $.each(eles, function (ele, index) {
                    //                        if (str(ele, index))
                    //                            list.push(ele)
                    //                    }, this);
                    list = $.filterArray(eles, str, this);
                }
                else if (/same/.test(str)) {
                    if (eles.length > 1) {
                        for (var len = eles.length, list = [eles[0]], result = true, i = 1, j = 0; i < len; i++) {
                            j = 0;
                            for (; j < list.length; j++) {
                                if (eles[i] === list[j]) {
                                    result = false;
                                    break;
                                }
                            }
                            result && list.push(eles[i]);
                            result = true;
                        }
                    }
                    else {
                        list = eles;
                    }
                }
                //            else if (/different/.test(str)) {
                //                if (eles.length > 1) {
                //                    for (var len = eles.length, i = 1, j = 0; i < len; i++) {
                //                        j = i + 1;
                //                        for (; j < list.length; j++) {
                //                            if (eles[i] === eles[j]) {
                //                                list.push(eles[i]);
                //                                j = ++i;
                //                                break;
                //                            }
                //                        }
                //                    }
                //                }
                //            }
                else if (/^eq\(([\+\-]?\d+),\+?(\d+)?\)/.test(str)) {
                    list = $.slice(eles, reg.$1, reg.$2 || 1);
                }
                else if (/first/.test(str))
                    list = eles.slice(0, 1);
                else if (/last/.test(str))
                    list = eles.slice(-1);
                else if (/^(gt|lt)\(([\-\+]?\d+)\)/.test(str)) {
                    num = parseInt(reg.$2);
                    num = num < 0 ? eles.length + num : num;
                    list = str.indexOf("gt") > -1 ? eles.slice(num + 1) : eles.slice(0, num - 1)
                }
                else if (/even/.test(str))
                    $.each(eles, function (ele, index) {
                        index % 2 == 1 && list.push(ele);
                    }, this);
                else if (/odd/.test(str))
                    $.each(eles, function (ele, index) {
                        index % 2 == 0 && list.push(ele)
                    }, this);
                else if (/children/.test(str))
                    list = $.children(eles);
                else if (/posterity/.test(str))
                    list = $.posterity(eles);
                else if (/(selected|checked)/.test(str))//checked
                    $.each(eles, function (ele) {
                        if ($.isNode(ele, "input") || $.isNode(ele, "option")) {
                            num = ele[reg.$1];
                            if (num === true || num == reg.$1 || num == "true")
                                list.push(ele);
                        }
                    }
               , this);
                else if ((/(enabled|disabled)/.test(str))) //checked
                    $.each(eles, function (ele) {
                        if (!$.isNode(ele, "input")) return;
                        num = ele["disabled"];
                        if (num === true || num == reg.$1 || num == "true")
                            reg.$1 === "disabled" && list.push(ele);
                        else
                            reg.$1 === "enabled" && list.push(ele);
                    }
               , this);
                else if (/(hidden|visible)/.test(str)) {
                    var result1 = reg.$1.indexOf("hidden") > -1, result2;
                    $.each(eles, function (ele) {
                        result2 = ele.style['visibility'] == 'hidden' || ele.style['display'] == 'none';
                        if (result1 && result2)
                            list.push(ele);
                        else if (!result1 && !result2)
                            list.push(ele);
                    }
               , this);
                }
                else if (/input/.test(str)) {
                    list = $.find("input,select,button", eles);
                }
                else if (/button/.test(str)) {
                    $.each($.find("input", eles), function (ele) {
                        ele["type"] == "button" && list.push(ele)
                    }, this);
                    list.concat($.find("button", eles));
                }
                else if (/(input|button|text|password|radio|checkbox|submit|image|reset|file|tel)/.test(str)) {
                    $.each($.find("input", eles), function (ele) {
                        num = ele["type"];
                        $.isStr(num) && num.toLowerCase() == reg.$1 && list.push(ele);
                    }, this);
                }

                return list;
            },

            getEle: function (ele, context) {
                /// <summary>通过各种筛选获得包含DOM元素的数组</summary>
                /// <param name="ele" type="Element/$/document/str">各种筛选</param>
                /// <param name="ele" type="Element/document/undefined">各种筛选</param>
                /// <returns type="Array" />
                var list = [], tmp;
                if ($.isStr(ele)) {
                    ele = $.util.trim(ele);
                    if (/^<.*>$/.test(ele)) {
                        list = $.elementCollectionToArray($.createEle(ele), false);
                    } else {
                        tmp = context || document;
                        list = $.find(ele, tmp.documentElement || context);
                    }
                }
                else if ($.isEle(ele))
                    list = [ele];
                else if ($.isArr(ele)) {
                    $.each(ele, function (result) {
                        $.isEle(result) && list.push(result);
                    }, this);
                    list = $.filter("same", list);
                }
                else if (ele instanceof $)
                    list = ele.eles;
                else if ($.isEleConllection(ele)) {
                    list = $.elementCollectionToArray(ele, true);
                }
                else if (ele === document)
                    list = [ele.documentElement];
                else if (ele === window)
                    list = [window]//有风险的
                else if ($.isDoc(ele)) {
                    list = [ele.documentElement];
                }

                return list;
            },
            getEleByClass: function (className, eles) {
                /// <summary>通过样式名获得DOM元素
                /// <para>返回为ele的arr集合</para>
                /// </summary>
                /// <param name="className" type="String">样式名</param>
                /// <param name="eles" type="Element/ElementCollection/Array[Element]">从元素中获取</param>
                /// <returns type="Array" />
                if ($.isEle(eles))
                    eles = [eles];
                var list = [];
                if (eles[0].getElementsByClassName)
                    $.each(eles, function (ele) {
                        list = list.concat($.elementCollectionToArray(ele.getElementsByClassName(className)));
                    }, this);
                else
                    $.each(eles, function (ele) {
                        list = list.concat($.iterationPosterity(ele, function (child, arr) {
                            if ($.isEle(child) && $.containsClass(child, className))
                                return true
                        }));
                    }, this);
                return list;
            },
            getEleById: function (id, doc) {
                /// <summary>通过ID获得一个DOM元素</summary>
                /// <param name="id" type="String">id</param>
                /// <param name="doc" type="Document">document</param>
                /// <returns type="Element" />

                return $.isStr(id) ? (doc || document).getElementById(id) : null;
            },
            getEleByTag: function (tag, eles) {
                /// <summary>通过标签名获得DOM元素</summary>
                /// <param name="tag" type="String">标签名</param>
                /// <param name="eles" type="Element/ElementCollection/Array[Element]">从元素或元素集合中获取</param>
                /// <returns type="Array" />
                if (eles) {
                    var str = 'getElementsByTagName', list = [], temp;
                    if ($.isEle(eles))
                        return $.elementCollectionToArray(eles[str](tag));
                    if ($.isEleConllection(eles) || $.isArr(eles)) {
                        $.each(eles, function (ele) {
                            temp = ele[str](tag)
                            if (temp.length > 0)
                                list = list.concat($.elementCollectionToArray(temp));
                            //list = list.concat(temp);
                        }, this);
                        return list;
                    }
                }
                return null;
            },
            getFirstChild: function (ele) {
                /// <summary>获得当前DOM元素的第一个真DOM元素</summary>
                /// <param name="ele" type="Element">dom元素</param>
                /// <returns type="Element" />
                var x = ele.firstChild;
                while (x && !$.isEle(x)) {
                    x = x.nextSibling;
                }
                return x;
            },
            getSelfIndex: function (ele) {
                /// <summary>通过序号获得当前DOM元素某个真子DOM元素 从0开始</summary>
                /// <param name="ele" type="Element">dom元素</param>
                /// <returns type="Number" />
                var i = -1, node = ele.parentNode.firstChild;
                while (node) {
                    if ($.isEle(node) && i++ != undefined && node === ele) {
                        break;
                    }
                    node = node.nextSibling;
                }
                return i;
            },
            iterationPosterity: function (ele, fun) {
                /// <summary>遍历当前元素的所有子元素并返回符合function条件的DOM元素集合</summary>
                /// <param name="ele" type="Element">DOM元素</param>
                /// <param name="fun" type="Function">筛选的方法</param>
                /// <returns type="Array" />
                return $.filter(function (child) {
                    return fun(child);
                }, $.posterity(ele));
                //return list.length > 0 ? list : null;
            },

            map: function( eles, callback, arg ) {
                var value,
                  i = 0,
                  length = eles.length,
                  isArray = $.isArrlike( eles ),
                  ret = [];

                // Go through the array, translating each of the items to their
                if ( isArray ) {
                  for ( ; i < length; i++ ) {
                    value = callback( eles[ i ], i, arg );

                    if ( value != null ) {
                      ret[ ret.length ] = value;
                    }
                  }

                // Go through every key on the object,
                } else {
                  for ( i in eles ) {
                    value = callback( eles[ i ], i, arg );

                    if ( value != null ) {
                      ret[ ret.length ] = value;
                    }
                  }
                }

                // Flatten any nested arrays
                return core_concat.apply([], ret);
            },    

            property: function (str, eles) {
                /// <summary>属性筛选器
                /// <para>arr返回元素数组</para>
                /// <para>[id]</para>
                /// <para>[id='test1']</para>
                /// <para>[id!='test1']</para>
                /// <para>[id*='test1']</para>
                /// <para>[id^='test1']</para>
                /// <para>[id$='test1']</para>
                /// </summary>
                /// <param name="str" type="String">筛选字符产</param>
                /// <param name="eles" type="Element/ElementCollection/Array">筛选范围</param>
                /// <returns type="Array" />
                var list = [];
                if (!str || !eles) {
                    return list;
                }
                var match = str.match(rProperty)
                , name = match[1]
                , type = match[2]
                , value = match[4]
                , fun = propertyFun[type || "default"];

                if (type && !value) {
                    return list;
                }

                list = $.filter(function (item) {
                    return fun(attr.getAttr(item, name), value); //是否该这样拿属性 存疑
                }, eles);
                return list;
            },

            query: function (str, eles) {
                /// <summary>筛选命令 所有后代元素
                /// <para>返回ele数组</para>
                /// </summary>
                /// <param name="str" type="String">字符串query</param>
                /// <param name="eles" type="Array/Element/ElementCollection">查询范围</param>
                /// <returns type="Array" />
                var list = [];
                if (!str || !eles) {

                }
                else if (rId.test(str)) {
                    var result = $.getEleById(reg.$1, eles.ownerDocument || eles[0].ownerDocument || document);
                    result && (list = [result]);
                }
                else if (rTagName.test(str)) {
                    list = $.getEleByTag(reg.$1, eles);
                }
                else if (rCss.test(str)) {
                    list = $.getEleByClass(reg.$1, eles);
                }
                return list;
            },

            search: function (str, eles) {
                /// <summary>筛选命令 所有后代元素
                /// <para>返回ele数组</para>
                /// </summary>
                /// <param name="str" type="String">字符串query</param>
                /// <param name="eles" type="Array/Element/ElementCollection">查询范围</param>
                /// <returns type="Array" />
                var list = [];
                if (!str || !eles) {
                    return list;
                }
                var children = $.children(eles);
                if (rId.test(str))
                    list = $.property("[id=" + reg.$1 + "]", children);
                else if (rTagName.test(str)) {
                    var result = reg.$1 == "*" ? true : false;
                    list = $.filter(function (ele) {
                        return result || $.isNode(ele, reg.$1); //ele.tagName.toLowerCase() === reg.$1.toLowerCase();
                    }, children);
                }
                else if (rCss.test(str)) {
                    var temp = reg.$1;
                    list = $.filter(function (ele) {
                        return $.containsClass(ele, temp) && true;
                    }, children);
                }
                return list;
            },
            sibling: function( n, ele ) {
                var r = [];

                for ( ; n; n = n.nextSibling ) {
                  if ( n.nodeType === 1 && n !== ele ) {
                    r.push( n );
                  }
                }

                return r;
            }
        };

    $.extend(query);
    $.expr[":"] = $.expr.pseudos;

    $.fn.extend({
        posterity: function (query) {
            /// <summary>返回当前对象的所有子元素</summary>
            /// <param name="str" type="String">字符串query</param>
            /// <param name="real" type="Boolean/Null">是否获得真元素，默认为真</param>
            /// <returns type="self" />
            var posterity = $.posterity(this.eles);
            if ($.isStr(query)) posterity = $.find(query, posterity);
            return $(posterity);
        },

        eq: function (i) {
            /// <summary>返回元素序号的新$</summary>
            /// <param name="num1" type="Number/null">序号 缺省返回第一个</param>
            /// <param name="num2" type="Number/null">长度 返回当前序号后几个元素 缺省返回当前序号</param>
            /// <returns type="$" />
            var len = this.length,
            j = +i + ( i < 0 ? len : 0 );
            return j >= 0 && j < len ? $(this[j]) : $([]);
        },

        filter: function (str) {
            /// <summary>筛选Element
            /// <para>返回arr第一项为查询语句</para>
            /// <para>返回arr第二项为元素数组</para>
            /// </summary>
            /// <param name="str" type="String/Function">字符串query或者筛选方法</param>
            /// <returns type="$" />

            return new $($.filter(str, this.eles));

        },
        find: function (str) {
            /// <summary>查询命令</summary>
            /// <param name="str" type="String">查询字符串</param>
            /// <returns type="$" />
            return new $($.find(str, this.eles));
        },

        index: function (ele) {
            /// <summary>返回当前对象的第一个元素在同辈元素中的index顺序</summary>
            /// <param name="real" type="Boolean/Null">是否获得真元素，默认为真</param>
            /// <returns type="Number" />
            if ( !ele ) {
              return ( this[0] && this[0].parentNode ) ? this.first().prevAll().length : -1;
            }

            // index in selector
            if ( $.isStr(ele) ) {
              return $.inArray( $( ele ), this[0] );
            }

            // Locate the position of the desired element
            return $.inArray(
              // If it receives a jQuery object, the first element is used
              this, $.is$(ele) ? ele[0] : ele );
        },
        is: function (str) {
            /// <summary>返回筛选后的数组是否存在</summary>
            /// <param name="str" type="String">查询字符串</param>
            /// <returns type="Boolean" />
            return !!str && (
                $.isStr(str) ?
                    rneedsContext.test( selector ) ?
                    $.find( str, this.context ).index( this[0] ) >= 0 :
                    $.filter( str, this.eles ).length > 0 :
                this.filter(str).length > 0
            );
        },

        map: function( callback ) {
            return $( $.map(this, function( ele, i ) {
              return callback.call( ele, i, ele );
            }));
        },
        
        property: function (str, eles) {
            /// <summary>属性筛选器
            /// <para>arr返回元素数组</para>
            /// <para>[id]</para>
            /// <para>[id='test1']</para>
            /// <para>[id!='test1']</para>
            /// <para>[id*='test1']</para>
            /// <para>[id^='test1']</para>
            /// <para>[id$='test1']</para>
            /// </summary>
            /// <param name="str" type="String">筛选字符产</param>
            /// <returns type="self" />
            return new $($.property(str, this.eles));
        },

        query: function (str) {
            /// <summary>通过字符串寻找所有后代节点</summary>
            /// <param name="str" type="String">查询字符串</param>
            /// <returns type="$" />
            return new $($.find(str, this.eles));
        },

        search: function (str) {
            /// <summary>通过字符串寻找子节点</summary>
            /// <param name="str" type="String">查询字符串</param>
            /// <returns type="$" />
            return new $($.search(str, this.eles));
        },

        slice: function(num, len){
            /// <summary>返回元素序号的新$</summary>
            /// <param name="num1" type="Number/null">序号 缺省返回第一个</param>
            /// <param name="num2" type="Number/null">长度 返回当前序号后几个元素 缺省返回当前序号</param>
            /// <returns type="$" />
            return $($.slice(this, num, len));
        }
    });

    function sibling( cur, dir ) {
      do {
        cur = cur[ dir ];
      } while ( cur && cur.nodeType !== 1 );

      return cur;
    }

    $.each({
      parent: function( ele ) {
        var parent = ele.parentNode;
        return parent && parent.nodeType !== 11 ? parent : null;
      },
      parents: function( ele ) {
        return $.dir( ele, "parentNode" );
      },
      parentsUntil: function( ele, i, until ) {
        return $.dir( ele, "parentNode", until );
      },
      next: function( ele ) {
        return sibling( ele, "nextSibling" );
      },
      prev: function( ele ) {
        return sibling( ele, "previousSibling" );
      },
      nextAll: function( ele ) {
        return $.dir( ele, "nextSibling" );
      },
      prevAll: function( ele ) {
        return $.dir( ele, "previousSibling" );
      },
      nextUntil: function( ele, i, until ) {
        return $.dir( ele, "nextSibling", until );
      },
      prevUntil: function( ele, i, until ) {
        return $.dir( ele, "previousSibling", until );
      },
      siblings: function( ele ) {
        return $.sibling( ( ele.parentNode || {} ).firstChild, ele );
      },
      children: function( ele ) {
        return $.sibling( ele.firstChild );
      },
      contents: function( ele ) {
        return $.nodeName( ele, "iframe" ) ?
          ele.contentDocument || ele.contentWindow.document :
          $.merge( [], ele.childNodes );
      }
    }, function(fn, name) {
      $.fn[ name ] = function( until, selector ) {
        var ret = $.map( this, fn, until );

        if ( !runtil.test( name ) ) {
          selector = until;
        }

        if ( selector && typeof selector === "string" ) {
          ret = $.filter( selector, ret );
        }

        ret = this.length > 1 && !guaranteedUnique[ name ] ? $.unique( ret ) : ret;

        if ( this.length > 1 && rparentsprev.test( name ) ) {
          ret = ret.reverse();
        }

        return $(ret);
      };
    });

    $.interfaces.achieve("constructorQuery", function (type, a, b) {
        return query.getEle(a, b);
    });

    return query;
}, "reference JQuery1.9.1");