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

	describe( 'when loading valid config with defaults but no environment variables', function() {
		var cfg = require( '../src/configya.js' )( './spec/test.json', 
				{ nested: { key: 'imma default!' }, another: { key: 'hiya' } } );
		it( 'should prefer file value over default', function() {
			cfg.nested.key.should.equal( 'a test of nested keys from files' );
		} );

		it( 'missing key should return default', function() {
			cfg.another.key.should.equal( 'hiya' );
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

	describe( 'with identical child trees', function() {
		var cfg
		before( function() {
			process.env[ 'test_redis_port' ] = 6379;
			process.env[ 'test_riak_port' ] = 8087;
			cfg = require( '../src/configya.js' )( 
				{ 
					test: { 
						redis: { address: '127.0.0.1', port: 1234 },
						riak: { address: 'riak1', port: 5678 }
					}
				} );
		} );

		it( 'should keep environment ports seperate', function() {
			cfg.test.riak.port.should.equal( '8087' );
			cfg.test.redis.port.should.equal( '6379' );
		} );

		it( 'should keep default addresses seperate', function() {
			cfg.test.riak.address.should.equal( 'riak1' );
			cfg.test.redis.address.should.equal( '127.0.0.1' );
		} );
	} );

	describe( 'with child property matching root property', function() {
		var cfg;
		before( function() {
			cfg = require( '../src/configya.js' )( { 'test-key': 'root key value', child: { 'test-key': 'child key value' } } );
		} );

		it( 'should not overwrite root property', function() {
			cfg[ 'test-key' ].should.equal( 'root key value' );
		} );
	} );

	describe( 'with empty default property', function() {
		var cfg;
		before( function() {
			cfg = require( '../src/configya.js' )( 
				{
					integration: {
						agent: {
							loglevel: 'info',
							id: 'p6-test'
						}
					} 
				},
				'./spec/test.json' );
		} );

		it( 'should not overwrite root property', function() {
			cfg.integration.agent.id.should.equal( 'test123' );
			cfg.integration.agent.loglevel.should.equal( 'trace' );
		} );
	} );

	after( function() {
		delete process.env[ 'test_redis_port' ];
		delete process.env[ 'test_riak_port' ];
		delete process.env[ 'missing_from_config' ];
		delete process.env[ 'deploy-type' ];
	} );
} );