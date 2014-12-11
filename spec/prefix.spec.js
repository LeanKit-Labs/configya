describe( 'when accessing configuration data directly while providing environment prefix', function() {
	describe( 'when loading valid config without environment variables', function() {
		var cfg = require( '../src/configya.js' )({
			file: './spec/test.json',
			prefix: 'lk'
		});

		it( 'missing key should be missing', function() {
			( cfg.thing === undefined )
				.should.be.true;
		} );

		it( 'valid key should return value', function() {
			cfg[ 'test-key' ]
				.should.equal( 'hulloo' );
		} );
	});

	describe( 'when loading valid config with environment variables', function() {
		var cfg;

		before( function() {
			process.env[ 'LK_MISSING_FROM_CONFIG' ] = 'lol';
			process.env[ 'LK__CAMEL_CASE' ] = 'camelCase';
			process.env[ 'lk_override-me' ] = 'OVERRIDDEN!';
			cfg = require( '../src/configya.js' )({
				file: './spec/test.json',
				prefix: 'lk'
			});
		} );

		after( function() {
			delete process.env[ 'LK_MISSING_FROM_CONFIG' ];
			delete process.env[ 'LK__CAMEL_CASE' ];
			delete process.env[ 'lk_override-me' ];
		} );

		describe( 'with no deploy-type environment var set', function() {
			it( 'missing key should be missing', function() {
				( cfg.thing === undefined )
					.should.be.true;
			} );

			it( 'environment key should return value', function() {
				cfg.missing.from.config
					.should.equal( 'lol' );
			} );

			it( 'environment key with __ should support camelCase', function () {
				cfg.camelCase
					.should.equal( "camelCase" );
			} );

			it( 'environment key should override config key', function() {
				cfg[ 'override-me' ]
					.should.equal( 'OVERRIDDEN!' );
			} );

		} );
	} );
});

describe( 'when using deprecated API while providing environment prefix', function() {

	describe( 'when loading valid config without environment variables', function() {
		var cfg = require( '../src/configya.js' )({
			file: './spec/test.json',
			prefix: 'lk'
		});

		it( 'missing key should be missing', function() {
			( cfg.get( 'thing' ) === undefined )
				.should.be.true;
		} );

		it( 'missing key should return default', function() {
			cfg.get( 'thing', ':(' )
				.should.equal( ':(' );
		} );

		it( 'valid key should return value', function() {
			cfg.get( 'test-key' )
				.should.equal( 'hulloo' );
		} );
	} );

	describe( 'when loading valid config with environment variables', function() {
		var cfg;

		before( function() {
			process.env[ 'lk_missing_from_config' ] = 'woo!';
			process.env[ 'lk_override-me' ] = 'I HAZ OVERRIDE!';
			cfg = require( '../src/configya.js' )({
				file: './spec/test.json',
				prefix: 'lk'
			});
		} );

		after( function() {
			delete process.env[ 'lk_missing_from_config' ];
			delete process.env[ 'lk_override-me' ];
		} );

		describe( 'with no deploy-type environment var set', function() {
			it( 'missing key should be missing', function() {
				( cfg.get( 'thing' ) === undefined )
					.should.be.true;
			} );

			it( 'missing key should return default', function() {
				cfg.get( 'thing', ':(' )
					.should.equal( ':(' );
			} );

			it( 'environment key should return value', function() {
				cfg.get( 'missing_from_config' )
					.should.equal( 'woo!' );
			} );

			it( 'environment key should override config key', function() {
				cfg.get( 'override-me' )
					.should.equal( 'I HAZ OVERRIDE!' );
			} );

		} );
	} );
} );
