var fs = require( 'fs' );
var path = require( 'path' );
var gnosis = require( 'gnosis' )();
var _ = require( 'lodash' );

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

function parseFileIntoConfig( config, pathToCfg, options ) {
	var fullPath = path.resolve( pathToCfg );
	if ( fs.existsSync( fullPath ) ) {
		try {
			var raw = fs.readFileSync( fullPath );
			var json = JSON.parse( raw );
			var file = { __file__: {} };
			parseIntoTarget( json, file, '__file__' );
			if ( options.preferCfgFile ) {
				_.merge( config, file );
			} else {
				_.defaults( config, file );
			}
		} catch ( err ) {
			console.log( 'error parsing configuration at "', fullPath, '"', err );
		}
	}
}

module.exports = function( option ) {
	var preferCfgFile = process.env[ 'deploy-type' ] === 'DEV';
	var config = {
		__env__: {},
		// Deprecated, but still here for backwards compat ONLY
		get: function( key, defaultValue ) {
			var val = this.__env__[ key ];
			if ( preferCfgFile || !val ) {
				val = this[ key ] || val;
			}
			return val || defaultValue;
		}
	};

	parseIntoTarget( process.env, config, '__env__' );

	if ( _.isString( option ) ) {
		parseFileIntoConfig( config, option, {
			preferCfgFile: preferCfgFile
		} );
	} else if( option ) {
		var defaults = { __defaults__: {} };
		parseIntoTarget( option, defaults, '__defaults__' );
		_.defaults( config, defaults );
	}

	return config;
};