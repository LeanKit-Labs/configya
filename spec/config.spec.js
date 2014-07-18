require( 'should' );


describe( 'when using deprecated API (calling get())', function() {
	describe( 'when loading config that doesn\'t exist', function() {
		var cfg = require( '../src/configya.js' )( './spec/non-existant.json' );

		it( 'should return nothing', function() {
			( cfg.get( 'thing' ) === undefined )
				.should.be.true;
		} );
	} );

	describe( 'when loading valid config without environment variables', function() {
		var cfg = require( '../src/configya.js' )( './spec/test.json' );

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
			process.env[ 'missing_from_config' ] = 'env';
			process.env[ 'override-me' ] = 'OVERRIDE!';
			cfg = require( '../src/configya.js' )( './spec/test.json' );
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
					.should.equal( 'env' );
			} );

			it( 'environment key should override config key', function() {
				cfg.get( 'override-me' )
					.should.equal( 'OVERRIDE!' );
			} );

		} );

		describe( 'with deploy-type set to DEV for testing', function() {
			var cfg;

			before( function() {
				process.env[ 'deploy-type' ] = 'DEV';
				cfg = require( '../src/configya.js' )( './spec/test.json' );
			} );

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
					.should.equal( 'env' );
			} );

			it( 'config key should override environment key', function() {
				cfg.get( 'override-me' )
					.should.equal( "you will see this only when you have deploy-type set to 'DEV'" );
			} );

		} );
		after( function() {
			delete process.env[ 'missing_from_config' ];
			delete process.env[ 'deploy-type' ];
		} );
	} );
} );

describe( 'when accessing configuration data directly (new API)', function() {
	describe( 'when loading config that doesn\'t exist', function() {
		var cfg = require( '../src/configya.js' )( './spec/non-existant.json' );

		it( 'should return nothing', function() {
			( cfg.thing === undefined )
				.should.be.true;
		} );
	} );
	describe( 'when loading valid config without environment variables', function() {
		var cfg = require( '../src/configya.js' )( './spec/test.json' );

		it( 'missing key should be missing', function() {
			( cfg.thing === undefined )
				.should.be.true;
		} );

		it( 'valid key should return value', function() {
			cfg[ 'test-key' ]
				.should.equal( 'hulloo' );
		} );
		describe( 'when loading valid config with environment variables', function() {
			var cfg;

			before( function() {
				process.env[ 'missing_from_config' ] = 'env';
				process.env[ 'override-me' ] = 'OVERRIDE!';
				cfg = require( '../src/configya.js' )( './spec/test.json' );
			} );

			describe( 'with no deploy-type environment var set', function() {
				it( 'missing key should be missing', function() {
					( cfg.thing === undefined )
						.should.be.true;
				} );

				it( 'environment key should return value', function() {
					cfg.missing.from.config
						.should.equal( 'env' );
				} );

				it( 'environment key should override config key', function() {
					cfg[ 'override-me' ]
						.should.equal( 'OVERRIDE!' );
				} );

			} );
		} );

	} );
	describe( 'with deploy-type set to DEV for testing', function() {
		var cfg;

		before( function() {
			process.env[ 'deploy-type' ] = 'DEV';
			cfg = require( '../src/configya.js' )( './spec/test.json' );
		} );

		it( 'missing key should be missing', function() {
			( cfg.thing === undefined )
				.should.be.true;
		} );

		it( 'environment key should return value', function() {
			cfg[ 'missing_from_config' ]
				.should.equal( 'env' );
		} );

		it( 'config key should override environment key', function() {
			cfg[ 'override-me' ]
				.should.equal( "you will see this only when you have deploy-type set to 'DEV'" );
		} );

	} );

	describe( 'with nested file key', function() {
		var cfg;

		before( function() {
			cfg = require( '../src/configya.js' )( './spec/test.json' );
		} );

		it( 'should contain original key', function() {
			cfg[ 'NESTED_KEY' ].should.equal( 'a test of nested keys from files' );
		} );

		it( 'should contain nested key format', function() {
			cfg.nested.key.should.equal( 'a test of nested keys from files' );
		} );
	} );

	describe( 'with defaults literal', function() {
		var cfg;

		before( function() {
			cfg = require( '../src/configya.js' )( { 'missing_from_config': 'override-me', 'default_key': 'ohhai' } );
		} );

		it( 'should override default key from env', function() {
			cfg.missing.from.config.should.equal( 'env' );
		} );

		it( 'should supply default for missing key', function() {
			cfg.default.key.should.equal( 'ohhai' );
		} );
	} );

	after( function() {
		delete process.env[ 'missing_from_config' ];
		delete process.env[ 'deploy-type' ];
	} );
} );