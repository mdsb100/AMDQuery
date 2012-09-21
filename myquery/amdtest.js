﻿(function () {
    "use strict;"
    var _config = {
        amd: {
            async: false
            , detectCR: true
            , "debug": true
            , timeout: 15000
            , rootPath: "http://127.0.0.1:10489/myquery/myquery/" //null
        }
    }

    var tools = {
        argToArray: function (arg, start, end) {
            return [].slice.call(arg, start || 0, end || arg.length);
        }
        , console: (function () {
            var console = {
                log: function (info) {
                    /// <summary>控制台记录</summary>
                    /// <para>info.fn</para>
                    /// <para>info.msg</para>
                    /// <param name="info" type="String/Object">方法名</param>
                    /// <returns />
                    var a = arguments[2] || "log";
                    if (window.console[a]) {
                        var s = "";
                        if (info.fn && info.msg) {
                            s = ["call ", info.fn, "()", " error: ", info.msg].join("");
                        }
                        else {
                            s = info.toString();
                        }
                        window.console[a](s);
                    }
                }
                  , warn: function (info) {
                      /// <summary>控制台警告</summary>
                      /// <para>info.fn</para>
                      /// <para>info.msg</para>
                      /// <param name="info" type="String/Object">方法名</param>
                      /// <returns />
                      this.log(info, "warn");
                  }
                  , info: function (info) {
                      /// <summary>控制台信息</summary>
                      /// <para>info.fn</para>
                      /// <para>info.msg</para>
                      /// <param name="info" type="String/Object">方法名</param>
                      /// <returns />
                      this.log(info, "info");
                  }
                  , error: function (info, isThrow) {
                      /// <summary>控制台错误</summary>
                      /// <para>info.fn</para>
                      /// <para>info.msg</para>
                      /// <param name="info" type="String/Object">方法名</param>
                      /// <param name="isThrow" type="Boolean">是否强制曝出错误</param>
                      /// <returns />
                      var s = "";
                      if (info.fn && info.msg) {
                          s = ["call ", info.fn, "()", " error: ", info.msg].join("");
                      }
                      else {
                          s = info.toString();
                      }
                      if (window.console.error || !isThrow) {
                          window.console.error(s);
                      }
                      else {
                          throw new window[isThrow](s);
                      }
                  }
            };
            return console;
        })()

        , error: function (info, type) {
            var s = "";
            if (info.fn && info.msg) {
                s = ["call ", info.fn, "()", " error: ", info.msg].join("");
            }
            else {
                s = info.toString();
            }
            throw new window[type || "Error"](s);
        }
        , extend: function (a, b) {
            /// <summary>把对象的属性复制到对象一</summary>
            /// <param name="a" type="Object">对象</param>
            /// <param name="b" type="Object">对象</param>
            /// <returns type="a" />
            for (var i in b)
                a[i] = b[i];
            return a;
        }

        , getJScriptConfig: function (list, asc) {
            /// <summary>获得脚本配置属性</summary>
            /// <param name="list" type="Array:[String]">参数名列表</param>
            /// <param name="asc" type="Boolean">true为正序，兼容IE，意味着JS总是插入到第一个</param>
            /// <returns type="Object" />
            var _scripts = document.getElementsByTagName("script")
                    , _script = _scripts[asc === true ? 0 : _scripts.length - 1]
                    , i = 0, j = 0, item, attrs, attr, result = {};
            for (; item = list[i++]; ) {
                attrs = (_script.getAttribute(item) || "").split(/,|;/);
                if (item == "src") {
                    result[item] = attrs[0];
                    break;
                }
                j = 0;
                result[item] = {};
                for (; attr = attrs[j++]; ) {
                    attr = attr.split(/:|=/);
                    if (attr[1]) {
                        attr[1].match(/false|true|1|0/) && (attr[1] = eval(attr[1]));
                        result[item][attr[0]] = attr[1];
                    }
                    else {
                        attr[1].match(/false|true|1|0/) && (attr[0] = eval(attr[1]));
                        result[item] = attr[0];
                    }

                }
            }
            return result;
        }
        , getPath: function (key, suffix) {
            /// <summary>获的路径</summary>
            /// <param name="list" type="Array:[String]">参数名列表</param>
            /// <param name="asc" type="Boolean">true为正序，兼容IE，意味着JS总是插入到第一个</param>
            /// <returns type="Object" />
            var _key = key, _suffix = suffix, _aKey, _url, ma;
            if (!_suffix) { _suffix = '.js'; }
            if (ma = _key.match(/\.[^\/\.]*$/g)) {
                _url = _key;
                if (ma[ma.length - 1] != _suffix) {
                    _url += _suffix;
                }
            } else {
                _url = basePath + '/' + _key + (_suffix || ".js");
            }
            if (/^\//.test(_url)) {
                _url = rootPath + _url.replace(/\//, '');
            } else if (!/^[a-z]+?:\/\//
            .test(_url)) {
                _url = basePath + '/' + _url;
            }
            return _url;
        }

        , now: function () {
            /// <summary>返回当前时间的字符串形式</summary>
            /// <returns type="String" />
            return (new Date()).getTime();
        }

        , userAgent: function (userAgent, reg) {
            var version = userAgent.match(reg);
            version = version ? version[0].match(/\d+\.\d+/i) : false;
            return version ? parseFloat(version[0]) : false;
        }

    }
    , basePath = (function () {
        var ret = tools.getJScriptConfig(["src"]).src.replace(/\/[^\/]+$/, '');
        if (!/^[a-z]+?:\/\//
        .test(ret)) {
            var sl = document.location.toString();
            if (/^\//.test(ret)) {
                ret = sl.replace(/((.*?\/){3}).*$/, '$1') + ret.substr(1);
            } else {
                ret = sl.replace(/[^\/]+$/, '') + ret;
            }
        }
        return ret;
    } ())
    , rootPath = basePath.replace(/((.*?\/){3}).*$/, '$1')

    //quote from written by OYE.js
    var _define, _require;
    if (window.define) {
        tools.console.warn("window.define has defined");
        _define = window.define;
    }
    if (window.require) {
        tools.console.warn("window.require has defined");
        _require = window.require;
    }

    function ClassModule(module, dependencies, factory, status, container, fail) {
        if (!module) { return; }
        this.handlers = {};
        this.module = null;
        this.id = module;
        this.init(dependencies, factory, status, container, fail);
        ClassModule.setModule(module, this);

        //this.check();

    }
    //0:init 1:queue 2:require 3:define 4:ready

    //0 init 1 require 2define 3ready
    tools.extend(ClassModule, {
        anonymousID: null
        , cache: {}
        , container: {}
        , dependenciesMap: {}
        , detectCR: function (md, dp) {
            /// <summary>检测模块是否存在循环引用,返回存在循环引用的模块名</summary>
            /// <param name="md" type="String">要检测的模块名</param>
            /// <param name="dp" type="Array:[String]">该模块的依赖模块</param>
            /// <returns type="String" />
            if (!md) { return; }
            if (dp && dp.constructor != Array) { return; }
            var i, DM, dm, result, l = dp.length, dpm = ClassModule.dependenciesMap
                    , mdp = ClassModule.mapDependencies;
            for (i = 0; i < l; i++) {
                dm = dp[i];
                if (dm === md) { return dm; } //发现循环引用
                if (!dpm[md]) { dpm[md] = {}; }
                if (!mdp[dm]) { mdp[dm] = {}; }
                dpm[md][dm] = 1;
                mdp[dm][md] = 1; //建表
            }
            for (DM in mdp[md]) {
                result = ClassModule.detectCR(DM, dp); //反向寻找
                if (result) { return result; }
            }
        }
        , funBody: function (md) {
            //将factory强制转换为function类型，供ClassModule使用
            if (!md) { md = ''; }
            switch (typeof md) {
                case 'function': return md;
                case 'string': return function () { return new String(md); };
                case 'number': return function () { return new Number(md); };
                case 'boolean': return function () { return new Boolean(md); };
                default: return function () { return md; };
            }
        }
        , getContainer: function (id, a) {
            var src;
            if (ClassModule.container[id]) {
                src = ClassModule.container[id];
            }
            else {
                src = tools.getJScriptConfig(["src"], typeof a == "boolean" ? a : true).src || "it is local"; //或者改成某个字段是 config里的
                id && (ClassModule.container[id] = src);
            }
            return src;
        }
        , getPath: function (key, suffix) {
            var ret, path, ma;
            if (path = ClassModule.maps[key]) { } //不需要匹配前部分
            else { path = key }

            if (_config.amd.rootPath) {
                ma = key.match(/\.[^\/\.]*$/g)
                if (!ma || ma[ma.length - 1] != suffix) {
                    key += suffix;
                }
                ret = _config.amd.rootPath + key;
            }
            else {
                ret = tools.getPath(path, suffix);
            }
            return ret;
        }
        , getModule: function (k) {
            return this.modules[k];
        }
        , holdon: {}
        , loadDependencies: function (dependencies) {//要改
            var dep = dependencies, i = 0, len, item, module;
            if (!dep || dep.constructor == Array || dep.length) { return this; }
            setTimeout(function () {
                for (len = dep.length; i < length; i++) {//是否要用function 而不是for
                    item = dep[i];
                    module = ClassModule.getModule(item);
                    if (!module) {
                        require(item);
                    }
                    else if (module.getStatus() == 2) {
                        ClassModule.loadDependencies(module.dependencies);
                    }
                }
            }, 0);
            return this;
        }
        , loadJs: function (url, id, error) {
            var module = ClassModule.getModule(id);
            //该模块已经载入过，不再继续加载，主要用于require与define在同一文件
            if (ClassModule.resource[url] || (module && (module.getStatus() > 2))) {//_module && (_module._ready || !_module._fromRequire
                return this;
            }

            ClassModule.resource[url] = id;

            var scripts = document.createElement("script")
            , head = document.getElementsByTagName('HEAD')[0]
            , timeId;

            error && (scripts.onerror = function () {
                clearTimeout(timeId);
                error();
            });

            scripts.onload = scripts.onreadystatechange = function () {
                (!this.readyState || this.readyState == "loaded" || this.readyState == 'complete') && clearTimeout(timeId);
            }

            scripts.setAttribute("src", url);
            scripts.setAttribute('type', 'text/javascript');
            scripts.setAttribute('language', 'javascript');

            timeId = setTimeout(function () {
                error && error();
                scripts = scripts.onerror = scripts.onload = error = head = null;
            }, _config.amd.timeout);

            head.insertBefore(scripts, head.firstChild);
            return this;
        }
        , mapDependencies: {}
        , maps: {}
        , modules: {}
        , namedModules: {}
        , requireQueue: []
        , resource: {}
        , rootPath: null
        , setModule: function (k, v) {
            !this.getModule(k) && (this.modules[k] = v);
            return this;
        }
        , statusReflect: {
            0: "init",
            1: "queue",
            2: "require",
            3: "define",
            4: "ready"
        }
    });

    ClassModule.prototype = {
        addHandler: function (fn) {
            if (typeof fn == "function") {
                var h = this.handlers[this.id];
                h == undefined && (h = this.handlers[this.id] = []);
                h.push(fn);
            }
            return this;
        }
        , check: function () {
            var status = this.getStatus(), dps = this.dependencies;
            switch (status) {
                case 4:
                    this.holdReady().trigger();
                    break;
                case 3:
                    if (!dps || !dps.length) {
                        this.getReady();
                        break;
                    }
                case 2:
                case 1:
                case 0:
                    if (dps.length == 1 && dps[0] === this.id) {
                        break;
                    }
                default:
                    var aDP = [], hd = ClassModule.holdon, i = 0, sMD, sDP, mDP;
                    if (status > 0 && _config.amd.detectCR == true) {
                        if (sMD = ClassModule.detectCR(this.id, dps)) {
                            tools.error({ fn: 'define', msg: 'There is a circular reference between "' + sMD + '" and "' + module + '"' }, "ReferenceError");
                            return;
                        }
                    }
                    //加入holdon
                    for (; sDP = dps[i++]; ) {//有依赖自己的情况
                        mDP = ClassModule.getModule(sDP);
                        if (!mDP || mDP.getStatus() != 4) {
                            aDP.push(sDP);
                            if (hd[sDP]) {
                                hd[sDP].push(this.id);
                            } else {
                                hd[sDP] = [this.id];
                            }
                        }
                    }
                    //}
                    if (!aDP.length) {
                        //依赖貌似都准备好，尝试转正
                        this.getReady();
                    } else {
                        //ClassModule.setModule(this);
                        if (status >= 2) {//深入加载依赖模块 <=1？
                            this.loadDependencies();
                        }
                    }
                    break;
            }
            return this;
        }
        , constructor: ClassModule
        , getDependenciesMap: function () {
            var ret = [];
            if (_config.amd.detectCR) {
                var id = this.id, MD = ClassModule.dependenciesMap[id], DM
                    , module = ClassModule.getModule(id);

                ret.push({ name: id, status: module.getStatus(1), container: module.container });
                for (DM in MD) {
                    module = ClassModule.getModule(DM);
                    ret.push({ name: DM, status: module.getStatus(1), container: module.container });
                }
            }
            else {
                tools.console.warn({ fn: "getDependenciesMap", msg: "you had to set require.detectCR true for getting map list" });
            }
            return ret;
        }
        , getReady: function () {
            var dps = this.dependencies, l = dps.length, i = 0, dplist = [], id = this.id
                , sdp, md, map, F;

            for (; i < l; i++) {
                md = ClassModule.getModule(dps[i]);
                //如果依赖模块未准备好，或依赖模块中还有待转正的模块，则当前模块也不能被转正
                if (!md || md.status != 4) { return false; }
                dplist = dplist.concat(md.module);
            }
            this.setStatus(4);
            if (_config.amd.debug) {
                F = this.factory.apply(null, dplist) || {};
            }
            else {
                try { F = this.factory.apply(null, dplist) || {}; } catch (e) { }
            }

            F._AMD = {
                id: id
                        , dependencies: dps
                        , status: 4
                //, todo: this.todo
                        , container: this.container
                        , getDependenciesMap: this.getDependenciesMap
            };

            if (F && F.constructor != Array) { F = [F] };
            this.module = F;

            //_getMoudule(id, F);
            //当传入的模块是已准备好的，开启转正机会
            //setTimeout?
            this.holdReady().trigger();
        }
        , getStatus: function (isStr) {
            var s = this.status;
            return isStr == true ? ClassModule.statusReflect[s] : s;
        }
        , holdReady: function () {
            var md, hd = ClassModule.holdon[this.id], MD = ClassModule.modules;
            if (hd && hd.length) {
                for (; md = MD[hd.shift()]; ) {
                    md.getReady();
                }
            }
            return this;
        }
        , init: function (dependencies, factory, status, container, fail) {
            this.dependencies = dependencies;
            this.factory = factory;
            this.status = status || 0;
            this.container = container;
            this.fail = fail;
            return this;
        }
        , load: function () {
            var id = this.id, fail = this.fail, status = this.getStatus(), url;

            if (status == 2) {
                this.loadDependencies();
                return this;
            }
            if (status > 1) {
                return this;
            }

            (url = ClassModule.getPath(id, ".js"))
                    || tools.error({ fn: 'require', msg: 'Could not load module: ' + id + ', Cannot match its URL' });
            //如果当前模块不是已知的具名模块，则设定它为正在处理中的模块，直到它的定义体出现
            //if (!namedModule) { ClassModule.anonymousID = id; } //这边赋值的时候应当是影射的

            this.setStatus(2);
            if (!ClassModule.container[id]) {
                ClassModule.container[id] = url;
            }

            if (ClassModule.cache[id]) {
                ClassModule.cache[id]();
            } else {
                _config.amd.async == true
                        ? window.setTimeout(function () {
                            ClassModule.loadJs(url, id, fail);
                        }, 0)
                        : ClassModule.loadJs(url, id, fail);
            }
            return this;
        }
        , loadDependencies: function () {//要改
            var dep = this.dependencies, i = 0, len, item, module;
            if (!(dep && dep.constructor == Array && dep.length)) { return this; }
            for (len = dep.length; i < len; i++) {//是否要用function 而不是for
                item = dep[i];
                module = ClassModule.getModule(item);
                if (!module) {
                    require(item);
                }
                //                        else if (module.getStatus() == 2) {//?
                //                            module.loadDependencies();
                //                        }
            }
            return this;
        }
        , request: function (success) {
            this.addHandler(success);
            switch (this.status) {
                case 0:
                    this.check();
                    var namedModule = ClassModule.namedModules[this.id], self = this;
                    if (this.status == 0) {
                        if (namedModule) {
                            this.load();
                        }
                        else {
                            this.setStatus(1);
                            require._queue(function () {
                                if (!ClassModule.anonymousID) { ClassModule.anonymousID = self.id; }
                                self.load();
                            });
                        }
                    }
                    break;
                case 4:
                    this.check();
                    break;

            }

            return this;
        }
        , setStatus: function (status) {
            this.status = status;
            return this;
        }
        , trigger: function () {
            var h = this.handlers[this.id], item;
            if (h && h.constructor == Array && this.getStatus() == 4 && this.module) {

                for (; h.length && (item = h.splice(0, 1)); ) {
                    item[0].apply(window, this.module);
                }

            }
            return this;
        }
    }

    window.define = function (id, dependencies, factory, info) {
        var arg = arguments, ret, deep, body, container, status;

        switch (arg.length) {
            case 0: tools.error({ fn: "window.define", msg: id + ":define something that cannot be null" }, "TypeError");
                break
            case 1:
                body = id;
                id = ClassModule.anonymousID; //_resource[container]; 
                dependencies = [];
                factory = ClassModule.funBody(body);
                break;
            case 2:
                if (typeof arg[0] == "string") {
                    id = id; //tools.getJScriptConfig(["src"], true).src; //_tempId();_amdAnonymousID
                    body = dependencies;
                    dependencies = [];
                }
                else if (arg[0] && arg[0].constructor == Array) {
                    var temp = id;
                    id = ClassModule.anonymousID; //_resource[container]; // ; //_tempId();
                    body = dependencies;
                    dependencies = temp;
                }
                else {
                    tools.error({ fn: 'define', msg: id + ':The first arguments should be String or Array' }, "TypeError");
                }
                factory = ClassModule.funBody(body);
                break;
            default:
                if (!(typeof arg[0] == "string" && arg[1] && arg[1].constructor == Array)) {
                    tools.error({ fn: 'define', msg: id + ':two arguments ahead should be String and Array' }, "TypeError");
                }
                factory = ClassModule.funBody(arg[2]);
        }
        container = ClassModule.getContainer(id);
        if (ret = ClassModule.getModule(id)) {
            deep = ret.getStatus();
            //container = deep != 0 ? ClassModule.getContainer(id) : null;
            ret.init(dependencies, factory, 3, container);
        } else {
            container = /tempDefine/.test(id) ? "inner" : ClassModule.getContainer(id);
            ret = new ClassModule(id, dependencies, factory, 3, container);
        }

        ret.check(); //最后设为2？

        //if (!/_temp_/.test(id)) (container = ClassModule.getContainer(id)); //如果不是require定义的临时

        //执行请求队列
        if (!ClassModule.namedModules[id] && deep == 2) {
            ClassModule.anonymousID = null;
            require._dequeue();
        }

        return ret;

    };
    tools.extend(define, {
        amd: ClassModule.maps
        , noConflict: function () {
            window.define = _define;
            return define;
        }
    });

    window.require = function (module, success, fail) {
        if (!module) { return; }
        //如果请求一组模块则转换为对一个临时模块的定义与请求处理
        var ret
        if (module.constructor == Array) {
            if (!module.length) {
                return;
            }
            else if (module.length == 1) {
                module = module.join("");
            } else {
                var de = module;
                module = "tempDefine:" + module.join(",");
                ret = ClassModule.getModule(module) || define(module, de, function () { return tools.argToArray(arguments); });
            }
        }
        success && typeof success != "function" &&
                tools.error({ fn: 'require', msg: module + ':success should be a Function' }, "TypeError");

        if (typeof fail != "function") {
            fail = function () {
                tools.error({ fn: 'require', msg: module + ':Could not load , Cannot fetch the file' });
            };
        }

        ret = ret || ClassModule.getModule(module) || new ClassModule(module, [module], function () { return new String(module); }, 0, null, fail);

        return ret.request(success);
    };
    tools.extend(require, {
        list: []
        , _queue: function (fn) {
            if (typeof fn == "function") {
                this.list.push(fn);
                if (this.list[0] != "inprogress") {
                    this._dequeue();
                }
            }
            return this;
        }
        , _dequeue: function () {
            var fn = this.list.shift()
            if (fn && fn === "inprogress") {
                fn = this.list.shift();
            }

            if (fn) {
                this.list.splice(0, 0, "inprogress");
                fn();
            }
            return this;
        }
        , noConflict: function () {
            window.require = _require;
            return require;
        }

        , cache: function (cache) {
            var container = ClassModule.getContainer(null, ClassModule.amdAnonymousID ? true : false);
            //tools.extend(ClassModule.cache, a.cache);
            for (var i in cache) {
                require.named(i);
                ClassModule.cache[i] = cache[i];
                ClassModule.container[i] = container;
            }
            return this;
        }

        , named: function (name) {
            /// <summary>具名以用来可以异步加载</summary>
            /// <param name="name" type="Array/Object/String">具名名单</param>
            /// <returns type="self" />
            var i, b, n = name;
            if (n && n.constructor == Array) {
                for (i = 0; b = n[i++]; ) {
                    ClassModule.namedModules[b] = 1;
                }
            }
            else if (typeof n == "object") {
                for (var b in n) {
                    ClassModule.namedModules[b] = 1;
                }
            }
            else if (typeof n == "string") {
                ClassModule.namedModules[n] = 1;
            }
            return this;
        }

        , reflect: function (name, path) {
            /// <summary>映射路径</summary>
            /// <param name="name" type="Object/String">映射名</param>
            /// <param name="path" type="String/undefined">路径名</param>
            /// <returns type="self" />
            if (typeof name == "object") {
                for (var i in name) {
                    ClassModule.maps[i] = name[i];
                }
            }
            else if (typeof name == "string" && typeof path == "string") {
                ClassModule.maps[name] = path;
            }

            return this;
        }

        , config: function (a, b, c) {//name, path, named
            var len = arguments.length;
            switch (len) {
                case 1:
                    if (typeof a == "string" || a && a.constructor == Array) {
                        require.named(a);
                    }
                    else if (typeof a == "object") {
                        a.reflect && require.reflect(a.reflect);
                        a.named && a.named == true ? require.named(a.reflect) : require.named(a.named);
                        //如果named=true其实就是映射a.reflect 
                        a.amd && tools.extend(_config.amd, a.amd);
                        a.cache && require.cache(a.cache);

                    }
                    break;
                case 2:
                    require.reflect(a, b);
                    break;

            }
            return this;

        }
    });

})();