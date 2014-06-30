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

function parseEnvVarsIntoConfig( config ) {
	var undRegx = /^[_]+/;
	gnosis.traverse( process.env, function( instance, key, val, meta, root ) {
		var k = key.toLowerCase();
		config.__env__[ key ] = val;
		config[ key ] = val;
		var paths = undRegx.test( key ) ? [ k ] : k.split( "_" );
		ensurePath( config, val, paths );
	} );
}

function parseFileIntoConfig( config, pathToCfg, options ) {
	var fullPath = path.resolve( pathToCfg );
	if ( fs.existsSync( fullPath ) ) {
		try {
			var raw = fs.readFileSync( fullPath );
			var json = JSON.parse( raw );
			if ( options.preferCfgFile ) {
				_.merge( config, json );
			} else {
				_.defaults( config, json );
			}
		} catch ( err ) {
			console.log( 'error parsing configuration at "', fullPath, '"', err );
		}
	}
}

module.exports = function( configFile ) {
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

	parseEnvVarsIntoConfig( config );

	if ( configFile ) {
		parseFileIntoConfig( config, configFile, {
			preferCfgFile: preferCfgFile
		} );
	}

	return config;
};