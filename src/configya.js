var fs = require( 'fs' );
var path = require( 'path' );
var _ = require( 'lodash' );

function deepMerge( target, source, overwrite ) {
	_.each( source, function( val, key ) {
		var original = target[ key ];
		if( _.isObject( val ) ) {
			if( original ) { deepMerge( original, val ); }
			else { target[ key ] = val; }
		} else {
			 target[ key ] = ( ( original == undefined ) || overwrite ) ? val : original;
		}
	} );
}

function ensurePath( target, val, paths ) {
	var key = paths.shift();
	if ( paths.length === 0 ) {
		target[ key ] = val;
	} else {
		var child = target[ key ] || {};
		target[ key ] = child;
		ensurePath( child, val, paths );
	}
}

function camelCaseArray( arr ) {
	return arr.map( function ( item, i ) {
		if ( i > 0 ) {
			return item[0].toUpperCase() + item.substr(1);
		} else {
			return item;
		}
	});
}

function parseIntoTarget( source, target, cache, prefix ) {
	var preRgx = /^[_]*/;
	var prefixRgx = new RegExp("^"+prefix+"__","i");
	var postRgx = /[_]*$/;

	_.each( source, function( val, key ) {
		key = key.replace(prefixRgx,'');

		var k = key.toLowerCase();
		var scrubbed = k.replace( preRgx, '' ).replace( postRgx, '' );
		var paths = scrubbed.split( '__' ).map( function ( path ) {
			return camelCaseArray( path.split( '_' ) ).join( '' );
		});

		if(prefixRgx.test(paths[0])){
			paths.shift();
		}

		target[ key ] = val;
		target[ k ] = val;
		ensurePath( target, val, paths );
		if( cache ) {
			target[ cache ][ key ] = val;
			target[ cache ][ k ] = val;
		}
	} );
}

function readConfig( pathToCfg ) {
	var fullPath = path.resolve( pathToCfg );
	if ( fs.existsSync( fullPath ) ) {
		try {
			var raw = fs.readFileSync( fullPath );
			return JSON.parse( raw );
		} catch ( err ) {
			console.log( 'error parsing configuration at "', fullPath, '"', err );
			return {};
		}
	}
}

function buildConfig(options){
	var defaultsHash = { __defaults__: {} };
	var fileHash = { __file__: {} };
	var envHash = { __env__: {} };

	var json = options.file ? readConfig( options.file ) : {};
	var preferCfgFile = process.env[ 'deploy-type' ] === 'DEV';

	var config = {
		__env__: {},
		// Deprecated, but still here for backwards compat ONLY
		get: function( key, defaultValue ) {
			return this[ key ] || defaultValue;
		}
	};

	parseIntoTarget( process.env, envHash, '__env__', options.prefix );
	parseIntoTarget( options.defaults || {}, defaultsHash, '__defaults__' );
	parseIntoTarget( json, fileHash, '__file__' );
	var fileOp = preferCfgFile ? 'merge' : 'defaults';

	_.merge( config, envHash );
	deepMerge( config, fileHash, preferCfgFile );
	deepMerge( config, defaultsHash );

	return config;
}

module.exports = function() {
	var args = Array.prototype.slice.call( arguments );
	var options = {};

	var newApi = args.length === 1
		&& _.isObject( options = args[0] )
		&& ( options.file || options.defaults );

	if ( !newApi ){
		options = {
			file: _.where( args, _.isString )[0],
			defaults: _.where( args, _.isObject )[0] || {}
		}
	}
	return buildConfig(options);
};
