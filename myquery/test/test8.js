/// <reference path="../myquery.js" />

define("test/test8", function () {
    return {
        alert: function () { console.log("test8"); }
    }
});

if (window.define) {
    tools.console.warn("window.define has defined");
    var _define = window.define;
}
if (window.require) {
    tools.console.warn("window.require has defined");
    var _require = window.require;
}
var 
            _maps = {},
            _modules = {},
        	_resource = {},
            _namedModules = {},
            _amdAnonymousID = null,
        	_dependenciesMap = {},
        	_mapDependencies = {},
            _cache = {},
            _container = {},
            random = 0;

var 
            _error = tools.error,

            _getPath = function (_key, _suffix) {
                var ret, path;
                if (path = _maps[_key]) { } //不需要匹配前部分
                else { path = _key }
                ret = tools.getPath(path, _suffix);
                return ret;
            },

            _getContainer = function (id, a) {
                var src;
                if (_container[id]) {
                    src = _container[id];
                }
                else {
                    src = tools.getJScriptConfig(["src"], $.isBol(a) ? a : true).src || "it is local";
                    id && (_container[id] = src);
                }
                //                if (src) {
                //                    //                    temp = src.replace(basePath, ""); //.replace("\/", "");
                //                    //                    if (temp == src) {
                //                    //                        src = "\/" + src.replace(rootPath, "");
                //                    //                    }
                //                    //                    else {
                //                    //                        src = src.replace("\/", "");
                //                    //                    }
                //                    //                    alert(src)

                //                }
                return src;
            },

            _loadJs = function (url, module, error) {
                var _module = _modules[module];
                //该模块已经载入过，不再继续加载，主要用于require与define在同一文件
                if (_module && (_module._ready || !_module._fromRequire)) {
                    return;
                }

                if (_resource[url]) { return; }
                _resource[url] = module; //_maps[module] || 
                //                complete: function () {
                //                    var head = document.getElementsByTagName("head")[0];
                //                    head.insertBefore(this, head.firstChild);
                //                    alert("insert")
                //                },

                var _scripts = document.createElement("script")
                , _head = document.getElementsByTagName('HEAD')[0]
                , _timeId;

                _scripts.onerror = error;

                _scripts.onload = _scripts.onreadystatechange = function () {
                    (!this.readyState || this.readyState == "loaded" || this.readyState == 'complete') && clearTimeout(_timeId);
                }

                _scripts.setAttribute("src", url);
                _scripts.setAttribute('type', 'text/javascript');
                _scripts.setAttribute('language', 'javascript');

                _timeId = setTimeout(function () {
                    error();
                    _scripts = _scripts.onerror = _scripts.onload = error = _head = null;
                }, _config.amd.timeout);

                _head.insertBefore(_scripts, _head.firstChild);
            },

            _detectCR = function (md, dp) {
                /// <summary>检测模块是否存在循环引用,返回存在循环引用的模块名</summary>
                /// <param name="md" type="String">要检测的模块名</param>
                /// <param name="dp" type="Array:[String]">该模块的依赖模块</param>
                /// <returns type="String" />
                if (!md) { return; }
                if (dp && !$.isArr(dp)) { return; }
                var i, DM, dm, _result, l = dp.length, _dpm = _dependenciesMap, _mdp = _mapDependencies;
                for (i = 0; i < l; i++) {
                    dm = dp[i];
                    if (dm === md) { return dm; } //发现循环引用
                    if (!_dpm[md]) { _dpm[md] = {}; }
                    if (!_mdp[dm]) { _mdp[dm] = {}; }
                    _dpm[md][dm] = 1;
                    _mdp[dm][md] = 1; //建表
                }
                for (DM in _mdp[md]) {
                    _result = _detectCR(DM, dp); //反向寻找
                    if (_result) { return _result; }
                }
            },

            _getMoudule = function (m, v) {
                if (v !== undefined) {
                    _modules[m] = v;
                }
                return _modules[m];
            },

            _loadDependencies = function (dependencies, from) {
                var _dep = dependencies;
                if (!_dep || !$.isArr(_dep) || !_dep.length) { return; }

                $.each(_dep, function (dp) {
                    var _module = _getMoudule(dp); //模块名

                    if (!_module) {
                        require(dp);
                    }
                    else if (from !== 'define' && _module._ready && dp !== _module._dependencies[0]) {
                        //如果此请求不是来自于define，依赖模块有待转正，且非自我依赖的模块，则重新请求它的依赖模块
                        _loadDependencies(_module._dependencies);
                    }
                });

            },

            _funBody = function (md) {
                //将factory强制转换为function类型，供ClassModule使用
                if (!md) { md = ''; }
                switch (typeof md) {
                    case 'function': return md;
                    case 'string': return function () { return new String(md); };
                    case 'number': return function () { return new Number(md); };
                    case 'boolean': return function () { return new Boolean(md); };
                    default: return function () { return md; };
                }
            },

            define = function (id, dependencies, factory) {
                var arg = arguments, ret, deep, body, container;

                switch (arg.length) {
                    case 0: _error({ fn: "window.defin", msg: "define something that cannot be null" }, "TypeError");
                        break
                    case 1:
                        body = id;
                        id = _amdAnonymousID; //_resource[container]; 
                        dependencies = [];
                        factory = _funBody(body);
                        break;
                    case 2:
                        if ($.isStr(arg[0])) {
                            id = id; //tools.getJScriptConfig(["src"], true).src; //_tempId();_amdAnonymousID
                            body = dependencies;
                            dependencies = [];
                        }
                        else if ($.isArr(arg[0])) {
                            var temp = id;
                            id = _amdAnonymousID; //_resource[container]; // ; //_tempId();
                            body = dependencies;
                            dependencies = temp;
                        }
                        else {
                            _error({ fn: 'define', msg: 'The first arguments should be String or Array' }, "TypeError");
                        }
                        factory = _funBody(body);
                        break;
                    default:
                        if (!($.isStr(arg[0]) && $.isArr(arg[1]))) {
                            _error({ fn: 'define', msg: 'The two arguments ahead should be String and Array' }, "TypeError");
                        }
                        factory = _funBody(arg[2]);
                }
                if (!/_temp_/.test(id)) (container = _getContainer(id)); //如果不是require定义的临时
                //                if (_modules[id]) {
                //                    _error({ fn: 'define', msg: "module " + id + ' has defined' });
                //                }

                deep = _modules[id];
                //如果该模块已经存在，且当前执行在require周期内，需要深入加载依赖模块
                deep = deep ? deep._fromRequire : false;

                ret = new _ClassModule(id, dependencies, factory, container, deep);
                //如果当前模块不是已知的具名模块，且当前执行在require周期内，则重置正在处理中的模块名
                if (!_namedModules[id] && deep) { _amdAnonymousID = null; }
                //if (deep) { _amdAnonymousID = null; }
                //执行请求队列
                require._queueRequire();

                return ret;
            },

            require = function (module, success, fail) {
                var url = {};
                if (!module) { return; }
                //如果请求一组模块则转换为对一个临时模块的定义与请求处理
                if ($.isArr(module)) {
                    var de = module;
                    module = "_temp_" + tools.now() + (random++);
                    define(module, de, function () { return $.argToArray(arguments); });
                }
                var ret = _modules[module] || new _ClassModule(module, [module], function () { return new String(module); }); //?
                success && !$.isFun(success) && _error({ fn: 'require', msg: 'success should be a Function' }, "TypeError");
                if (!fail || $.isFun(fail)) {
                    fail = function () {
                        _error({ fn: 'require', msg: 'Could not load module: ' + module + ', Cannot fetch the file' });
                    };
                }
                $.isFun(success) && ret.todo(success);
                var namedModule = _namedModules[module]; //关于是否异步加载 myquery的都应该是具名的
                //如果当前模块为require发出，且之前没有定义过
                if ($.isArr(ret._dependencies) && ret._dependencies.join('') === module) {
                    if (_amdAnonymousID && !namedModule) {
                        //如果有某个模块正在处理中，且当前请求的模块不是已知的具名模块，则将当前请求丢到请求队列) {
                        require._requireQueue.push([module, success, fail]);
                        return ret;
                    }
                    (url = _getPath(module, ".js")) || _error({ fn: 'require', msg: 'Could not load module: ' + module + ', Cannot match its URL' });
                    //如果当前模块不是已知的具名模块，则设定它为正在处理中的模块，直到它的定义体出现
                    if (!namedModule) { _amdAnonymousID = module; } //这边赋值的时候应当是影射的
                    //_amdAnonymousID = module;
                    //如果define和require都在同一页面，则避免发出JS的请求
                    if (_cache[module]) {
                        _cache[module]();
                    } else {
                        _config.amd.async == true
                        ? window.setTimeout(function () {
                            _loadJs(url, module, fail);
                        }, 0)
                        : _loadJs(url, module, fail);
                    }

                } else if (!ret._ready) {//此模块之前已经定义过，但是其依赖未准备好
                    _loadDependencies(ret._dependencies, 'require');
                }
                //如果模块准备好，则执行它的成功回调
                return this;
            };

var _ClassModule = function (module, dependencies, factory, container, deep) {//继承了_CustomEventmodule, dependencies, factory, deep
    if (!module) { return; }
    var dps = dependencies;
    this._id = module;
    this._dependencies = dps;
    this._factory = factory;
    this._container = container;
    this._ready = false;


    if (!dps || !dps.length) {
        //无依赖模块，直接转正
        this._getReady();
    }
    else {
        var aDP = [], hd = this._holdon, i = 0, sMD, sDP, mDP;
        if (dps.length === 1 && dps[0] === module) {
            //来自require的请求，模块依赖自己
            this._fromRequire = true;
            _modules[module] = this;
        } else {
            //检测是否存在循环依赖
            if (_config.amd.detectCR == true && (sMD = _detectCR(module, dps))) {
                _error({ fn: 'define', msg: 'There is a circular reference between "' + sMD + '" and "' + module + '"' }, "ReferenceError");
                return;
            }
            //有依赖，加入待转正模块
            for (; sDP = dps[i++]; ) {
                mDP = _modules[sDP];
                if (!mDP || mDP._getReady) {
                    aDP.push(sDP);
                    if (!hd[sDP]) {
                        hd[sDP] = [module];
                    } else {
                        hd[sDP].push(module);
                    }
                }
            }
            if (!aDP.length) {
                //依赖貌似都准备好，尝试转正
                this._getReady();
            } else {
                _modules[module] = this;
                if (deep) {//深入加载依赖模块
                    _loadDependencies(aDP, 'define');
                }
            }
        }
    }
};

_ClassModule.prototype = {
    _holdon: {}
                , _handlers: {}
                , constructor: _ClassModule

                , _getReady: function () {//转正
                    var dps = this._dependencies, l = dps.length, i = 0, dplist = [], id = this._id
                    , sdp, md, map, F;

                    for (; i < l; i++) {
                        md = _modules[dps[i]];
                        //如果依赖模块未准备好，或依赖模块中还有待转正的模块，则当前模块也不能被转正
                        if (!md || md._getReady) { return false; }
                        dplist.push(md);
                    }
                    this._ready = true;
                    if (_config.amd.debug) {
                        F = this._factory.apply(null, dplist) || {};
                    }
                    else {
                        try { F = this._factory.apply(null, dplist) || {}; } catch (e) { }
                    }
                    F = F || {};
                    F._AMD = {
                        _id: id
                        , dependencies: dps
                        , _ready: true
                        //, todo: this.todo
                        , container: this._container
                        , getDependenciesMap: this.getDependenciesMap
                    };
                    _getMoudule(id, F);
                    //当传入的模块是已准备好的，开启转正机会
                    this._holdReady().trigger(F);

                    return true;
                }

                , _holdReady: function () {
                    var md, hd = this._holdon[this._id], MD = _modules;
                    if (hd && hd.length) {
                        for (; md = MD[hd.shift()]; ) {
                            md._getReady();
                        }
                    }
                    return this;
                }

                , todo: function (fn) {
                    var h = this._handlers[this._id];
                    h == undefined && (h = this._handlers[this._id] = []);
                    h.push(fn);
                    return this;
                }

                , trigger: function (paras) {
                    var h = this._handlers[this._id], item;
                    if (h instanceof Array) {
                        if (!$.isArr(paras)) { paras = [paras] }
                        for (; h.length && (item = h.splice(0, 1)); ) {
                            item[0].apply(window, paras);
                        }

                    }
                    return this;
                }

                , getDependenciesMap: function () {
                    var ret = []
                    if (_config.amd.detectCR) {
                        var sMD = this._id, MD = _dependenciesMap[sMD], DM
                        , module = _modules[sMD]
                        , status = module._AMD ? module._AMD._ready : module._ready;

                        ret.push(sMD + '[' + status + ']: ' + _getPath(sMD));
                        for (DM in MD) {
                            module = _modules[DM];
                            status = module._AMD ? module._AMD._ready : module._ready;
                            ret.push(DM + '[' + !!status + ']: ' + _getPath(DM));
                        }
                    }
                    else {
                        tools.console.warn({ fn: "getDependenciesMap", msg: "you had to set require.detectCR true for getting map list" });
                    }
                    return ret;
                }
}

window.define = define;
window.require = require;

$.easyExtend(window.define, {
    amd: _maps

            , namedModules: _namedModules
            , noConflict: function () {
                window.define = _define;
                return define;
            }
});

$.easyExtend(window.require, {
    _requireQueue: []

            , _queueRequire: function () {
                if (require._requireQueue.length) {
                    var _module = require._requireQueue.shift();
                    /* 造成多次require只执行一次，当模块定义在请求之后的情况下
                    var amdModule = module && _modules[module[0]];
                    while(module && amdModule && amdModule._amdDependencies.join('')!==module[0]){
                    module = _requireQueue.shift();
                    amdModule = module && _modules[module[0]];
                    }
                    */
                    if (!_module) {
                        require._queueRequire();
                        return;
                    }
                    require.apply(null, _module);
                }
            }

            , noConflict: function () {
                window.require = _require;
                return require;
            }

            , named: function (name) {
                /// <summary>具名以用来可以异步加载</summary>
                /// <param name="name" type="Array/Object/String">具名名单</param>
                /// <returns type="self" />
                var i, b, n = name;
                if ($.isArr(n)) {
                    for (i = 0; b = n[i++]; ) {
                        _namedModules[b] = 1;
                    }
                }
                else if ($.isObj(n)) {
                    for (var b in n) {
                        _namedModules[b] = 1;
                    }
                }
                else if ($.isStr(n)) {
                    _namedModules[n] = 1;
                }
                return this;
            }

            , reflect: function (name, path) {
                /// <summary>映射路径</summary>
                /// <param name="name" type="Object/String">映射名</param>
                /// <param name="path" type="String/undefined">路径名</param>
                /// <returns type="self" />
                if ($.isObj(name)) {
                    for (var i in name) {
                        _maps[i] = name[i];
                    }
                }
                else if ($.isStr(name) && $.isStr(path)) {
                    _maps[name] = path;
                }

                return this;
            }

            , config: function (a, b, c) {//name, path, named
                var len = arguments.length;
                switch (len) {
                    case 1:
                        if ($.isArr(a) || $.isStr(a)) {
                            require._named(a);
                        }
                        else if ($.isObj(a)) {
                            a.reflect && require.reflect(a.reflect);
                            a.named && a.named == true ? require.named(a.reflect) : require.named(a.named);
                            //如果named=true其实就是映射a.reflect 
                            a.amd && tools.extend(_config.amd, a.amd);

                            if (a.cache) {
                                var container = _getContainer(null, _amdAnonymousID ? true : false);
                                tools.extend(_cache, a.cache);
                                for (var i in a.cache) {
                                    _cache[i] = a.cache[i];
                                    _container[i] = container;
                                }
                            };
                            // a.timeout && (_timeout = a.timeout);
                        }
                        break;
                    case 2:
                        require.reflect(a, b);
                        break;

                }
                return this;

            }

});

tools.extend($, {
    define: function (id, dependencies, factory) {
        /// <summary>myQuery的define对象定义
        /// <para>遵循AMD规范重载</para>
        /// <para>只是myQuery.define默认会载入window和myQuery对象</para>
        /// </summary>
        /// <param name="id" type="String">对象名</param>
        /// <param name="dependencies" type="Array">依赖列表</param>
        /// <param name="factory" type="Function">对象工厂</param>
        /// <returns type="self" />
        var arg = $.argToArray(arguments, 0)
                , len = arg.length
                , fn = arg[len - 1]
                , version = "no signing version";
        if ($.isStr(fn)) {
            version = fn;
            fn = arg[len - 2];
        }
        mmodule[id] = version;
        if ($.isFun(fn)) {
            arg[arg.length - 1] = $.bind(function () {
                var arg = $.argToArray(arguments, 0);
                arg.splice(0, 0, window, myQuery);
                if (_config.amd.debug) { return this.apply(null, arg); }
                else { try { return this.apply(null, arg); } finally { } }
            }, fn);
            window.define ? window.define.apply(null, arg) : fn(window, myQuery);
        }
        return this;
    }
             , require: function (a) {
                 //还没想好做些什么 先写出来
                 var arg = myQuery.argToArray(arguments);

                 window.require && window.require.apply(null, arguments)
                 return this;
             }
});