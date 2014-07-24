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
		k = key.toLowerCase();
	if ( paths.length === 0 ) {
		target[ k ] = val;
	} else {
		var child = target[ key ] || {};
		target[ k ] = child;
		ensurePath( child, val, paths );
	}
}

function parseIntoTarget( source, target, cache ) {
	var preRgx = /^[_]*/,
		postRgx = /[_]*$/;
	_.each( source, function( val, key ) {
		var k = key.toLowerCase(),
			scrubbed = key.replace( preRgx, '' ).replace( postRgx, '' ),
			paths = scrubbed.split( '_' );
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

module.exports = function() {
	var args = Array.prototype.slice.call( arguments );
	var file = _.where( args, _.isString )[ 0 ];
	var hash = _.where( args, _.isObject )[ 0 ] || {};
	var defaults = { __defaults__: {} };
	var fileHash = { __file__: {} };
	var envHash = { __env__: {} };
	var json = file ? readConfig( file ) : {};
	var preferCfgFile = process.env[ 'deploy-type' ] === 'DEV';
	
	var config = {
		__env__: {},
		// Deprecated, but still here for backwards compat ONLY
		get: function( key, defaultValue ) {
			return this[ key ] || defaultValue;
		}
	};
	
	parseIntoTarget( process.env, envHash, '__env__' );
	parseIntoTarget( hash, defaults, '__defaults__' );
	parseIntoTarget( json, fileHash, '__file__' );
	var fileOp = preferCfgFile ? 'merge' : 'defaults';
	
	_.merge( config, envHash );
	deepMerge( config, fileHash, preferCfgFile );
	deepMerge( config, defaults );

	return config;
};