define("module/MVVM", ["main/query", "main/attr", "main/CustomEvent", "main/object"], function(query, attr, object, CustomEvent) {
	var _tempMVVMData = null;

	var util = {
		checkInit: function(prototype) {
			if (!$.has("init", prototype)) {
				prototype.init = function() {

				}
			}
		}
	}

	var MVVM = {
		ViewList: {},
		ViewModelList: {},
		ModelList: {},
		CollectionList: {},

		factory: function(View, callback) {
			var ele = View,
				viewModel = query.getEleByTag("ViewModel", ele),
				models = query.getEleByTag("Model", ele),
				collections = query.getEleByTag("Collection", ele),
				i = 0,
				len = 0,
				viewSrc = attr.getAttr(view, "src"),
				viewModelSrc = attr.getAttr(viewModel, "src"),
				modelsSrc = [],
				collectionsSrc = [];

			for (i = 0, len = modelsSrc.length; i < len; i++) {
				modelsSrc.push(attr.getAttr(models[i], "src"));
			}

			for (i = 0, len = modelsSrc.length; i < len; i++) {
				collectionsSrc.push(attr.getAttr(collections[i], "src"));
			}

			_tempMVVMData = {
				view: view,
				viewSrc: viewSrc,
				viewModel: viewModel,
				viewModelSrc: viewModelSrc,
				models: models,
				modelsSrc: modelsSrc
				collections: collections,
				collectionsSrc: collectionsSrc
			}

			require(ViewModelSrc, function(){
				callback();
				_tempMVVMData = null;
			});
		},

		defineView: function() {},
		defineViewModel: function(prototype, statics) {
			//util.checkInit(prototype);
			var originInit = prototype.init;
			prototype.init = function(view, models, collections) {
				this._super(view, models, collections);


				originInit && originInit(view, models, collections);
				return this;
			}

			var dependencies = [_tempMVVMData.viewSrc].concat(_tempMVVMData.modelsSrc, _tempMVVMData.collectionsSrc),
				modelsLen = _tempMVVMData.Models.length;
			define(dependencies, function(view) {
				var ViewModel = object.extend(this.id, prototype, statics, BaseViewModel);

				var arg = $.argToArray(arguments),
					models = arg.slice(1, 1 + modelsLen),
					collections = arg.slice(1 + models.length, arguments.length);

				var viewModel = new ViewModel(view, models, collections);

				MVVM.ViewModelList[this.id] = viewModel;

				return viewModel;
			});
		},
		defineModel: function() {},
		defineCollection: function() {}

	};

	MVVM.Base = object.extend("Base", {
		init: function(type) {			
			this._super();
			this._setType(type);

		}
	}, CustomEvent);

	object.providePropertyGetSet(MVVM.Base, {
		type: "-pa -w"
	});

	MVVM.BaseView = object.extend("BaseView", {
		init: function() {

		}
	}, {}, MVVM.Base);

	MVVM.BaseViewModel = object.extend("BaseViewModel", {
		init: function() {
			this._super("ViewModel");
			this.setView(view)
				.setModels(models)
				.setCollections(collections);
		},
		initHandler: function() {

		}
	}, {}, MVVM.Base);

	object.providePropertyGetSet(MVVM.BaseViewModel, {
		view: "-pu -r",
		models: "-pu -r",
		collections: "-pu -r"
	});

	MVVM.BaseModel = object.extend("BaseModel", {
		init: function(view, models, collections) {
			this._super();
		}
	}, {}, MVVM.Base);

	MVVM.BaseViewCollection = object.extend("BaseViewCollection", {
		init: function() {
			this._super();
		}
	}, {}, MVVM.Base);

	$.MVVM = MVVM;
	return MVVM;
});