aQuery.define( "main/data", [ "base/extend", "base/typed", "base/support" ], function( $, utilExtend, typed, support, undefined ) {
	"use strict"; //启用严格模式

	// checks a cache object for emptiness

	// function isEmptyDataObject( obj ) {
	// 	var name;
	// 	for ( name in obj ) {

	// 		// if the public data object is empty, the private is still empty
	// 		if ( name === "data" && typed.isEmptyObject( obj[ name ] ) ) {
	// 			continue;
	// 		}
	// 		if ( name !== "toJSON" ) {
	// 			return false;
	// 		}
	// 	}

	// 	return true;
	// }

	var
	expando = "AMDQuery" + $.now( ),
		uuid = 0,
		windowData = {}, emptyObject = {},
		data = {
			cache: [ ],

			data: function( ele, name, data ) {
				/// <summary>获得或设置对象的数据
				/// <para>如果name是obj可能有风险，他会赋值所有的</para>
				/// <para>如果data是undefined会取值</para>
				/// </summary>
				/// <param name="ele" type="Object">对象</param>
				/// <param name="name" type="String/Object/null">如果为nul则删除全部</param>
				/// <param name="data" type="any">数据</param>
				/// <returns type="thisCache/any/$" />

				//quote from jQuery-1.4.1
				if ( !ele || ( ele.nodeName && $.noData[ ele.nodeName.toLowerCase( ) ] ) )
					return this;

				ele = ele == window ?
					windowData :
					ele;

				var id = ele[ expando ],
					cache = $.cache,
					thisCache;

				if ( !name && !id )
					return this;

				if ( !id )
					id = ++uuid;

				if ( typeof name === "object" ) {
					ele[ expando ] = id;
					thisCache = cache[ id ] = utilExtend.extend( true, {}, name );
				} else if ( cache[ id ] ) {
					thisCache = cache[ id ];
				} else if ( data === undefined ) {
					thisCache = emptyObject;
				} else {
					thisCache = cache[ id ] = {};
				}

				if ( data !== undefined ) {
					ele[ expando ] = id;
					thisCache[ name ] = data;
				}

				return typed.isStr( name ) ? thisCache[ name ] : thisCache;
			},

			expando: expando,

			noData: {
				//quote from jQuery-1.4.1
				"embed": true,
				"object": true,
				"applet": true
			},

			removeData: function( ele, name ) {
				/// <summary>删除对象的数据</summary>
				/// <param name="ele" type="Object">对象</param>
				/// <param name="name" type="String/undefined">如果为undefined则删除全部</param>
				/// <returns type="self" />
				if ( !ele || ( ele.nodeName && $.noData[ ele.nodeName.toLowerCase( ) ] ) )
					return this;

				ele = ele == window ?
					windowData :
					ele;

				var id = ele[ expando ],
					cache = $.cache,
					thisCache = cache[ id ];

				if ( name ) {
					if ( thisCache ) {
						delete thisCache[ name ];

						if ( typed.isEmptyObj( thisCache ) )
							$.removeData( ele );

					}

				} else {
					if ( support.deleteExpando ) {
						delete ele[ expando ];
					} else if ( ele.removeAttribute ) {
						ele.removeAttribute( expando );
					} else {
						ele[ expando ] = null;
					}
					delete cache[ id ];
				}
				return this;
			},

			hasData: function( ele ) {
				ele = ele.nodeType ? data.cache[ ele[ data.expando ] ] : ele[ data.expando ];
				return !!ele;
				//&& !isEmptyDataObject( ele );
			}
		};

	$.extend( data );

	$.fn.extend( {
		data: function( key, value ) {
			/// <summary>获得或设置对象的数据
			/// <para>如果key是obj可能有风险，他会赋值所有的</para>
			/// <para>如果value是undefined会取值</para>
			/// </summary>
			/// <param name="key" type="String/Object/null">如果为nul则删除全部</param>
			/// <param name="value" type="any">数据</param>
			/// <returns type="thisCache/any/$" />
			if ( key === undefined && this.length ) {
				return $.data( this[ 0 ] );
			} else if ( typed.isObj( key ) ) {
				return this.each( function( ele ) {
					$.data( ele, key );
				} );
			}
			return value === undefined ? $.data( this[ 0 ], key ) : this.each( function( ele ) {
				$.data( ele, key, value );
			} );
		},
		removeData: function( key ) {
			/// <summary>删除对象的数据</summary>
			/// <param name="key" type="String/null">如果为nul则删除全部</param>
			/// <returns type="self" />
			return this.each( function( ele ) {
				$.removeData( ele, key );
			} );
		}
	} );

	return data;
} );