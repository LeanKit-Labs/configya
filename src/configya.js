var fs = require( 'fs' ),
	path = require( 'path' );

var merge = function() {
	var args = Array.prototype.slice.call( arguments );
	var obj = {};
	while( args.length > 0 ) {
		var x = args.shift();
		for( key in x ) {
			var val = x [ key ];
			if( val ) {
				obj[ key ] = val;
			}
		}
	}
	return obj;
};

module.exports = function( configFile ) {
	var config = {
		get: function( key, defaultValue ) {
			var envVal = process.env[ key ];
			var useConfigBeforeEnvironmentVar = process.env[ 'deploy-type' ] === 'DEV';
			if(useConfigBeforeEnvironmentVar) {
				return this[ key ] || envVal || defaultValue;
			}
			return envVal || this[ key ] || defaultValue;
		}
	};
	if( configFile ) {
		var fullPath = path.resolve( configFile );
		if( fs.existsSync( fullPath )  ) {
			try {
				var raw = fs.readFileSync( fullPath );
				var json = JSON.parse( raw );
				config = merge( config, json );
			} catch ( err ) {
				console.log( 'error parsing configuration at "', fullPath, '"', err );
			}
		}
	}
	return config;
};