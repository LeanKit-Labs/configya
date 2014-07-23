var fs = require( 'fs' );
var path = require( 'path' );
var gnosis = require( 'gnosis' )();
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

function parseIntoTarget( source, target, original ) {
	var undRegx = /^[_]+/;
	gnosis.traverse( source, function( instance, key, val, meta, root ) {
		var k = key.toLowerCase();
		target[ k ] = val;
		target[ key ] = val;
		if( original ) {
			target[ original ][ key ] = val;
		}
		var paths = undRegx.test( key ) ? [ k ] : k.split( "_" );
		ensurePath( target, val, paths );
	} );
	return target;
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