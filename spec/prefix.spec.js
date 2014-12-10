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
			process.env[ 'LK__MISSING__FROM__CONFIG' ] = 'lol';
			process.env[ 'lk__override-me' ] = 'OVERRIDDEN!';
			cfg = require( '../src/configya.js' )({
				file: './spec/test.json',
				prefix: 'lk'
			});
		} );

		after( function() {
			delete process.env[ 'LK__MISSING__FROM__CONFIG' ];
			delete process.env[ 'lk__override-me' ];
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
			process.env[ 'lk__missing__from__config' ] = 'woo!';
			process.env[ 'lk__override-me' ] = 'I HAZ OVERRIDE!';
			cfg = require( '../src/configya.js' )({
				file: './spec/test.json',
				prefix: 'lk'
			});
		} );

		after( function() {
			delete process.env[ 'lk__missing__from__config' ];
			delete process.env[ 'lk__override-me' ];
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
				cfg.get( 'missing__from__config' )
					.should.equal( 'woo!' );
			} );

			it( 'environment key should override config key', function() {
				cfg.get( 'override-me' )
					.should.equal( 'I HAZ OVERRIDE!' );
			} );

		} );
	} );
} );
