require( 'should' );

describe( 'when configuring via arguments', function() {
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
				process.env[ 'missing__from__config' ] = 'env';
				process.env[ 'override-me' ] = 'OVERRIDE!';
				cfg = require( '../src/configya.js' )( './spec/test.json' );
			} );

			after( function() {
				delete process.env[ 'missing__from__config' ];
				delete process.env[ 'override-me' ];
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
			process.env[ 'missing__from__config' ] = 'env';
			cfg = require( '../src/configya.js' )( './spec/test.json' );
		} );

		after( function() {
			delete process.env[ 'deploy-type' ];
			delete process.env[ 'missing__from__config' ];
		} );

		it( 'missing key should be missing', function() {
			( cfg.thing === undefined )
				.should.be.true;
		} );

		it( 'environment key should return value', function() {
			cfg[ 'missing__from__config' ]
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
			cfg[ 'NESTED__KEY' ].should.equal( 'a test of nested keys from files' );
		} );

		it( 'should contain nested key format', function() {
			cfg.nested.key.should.equal( 'a test of nested keys from files' );
		} );
	} );

	describe( 'with defaults literal', function() {
		var cfg;

		before( function() {
			process.env["missing__from__config"] = "env";
			cfg = require( '../src/configya.js' )( { 'missing__from__config': 'override-me', 'default__key': 'ohhai' } );
		} );

		after( function() {
			delete process.env["missing__from__config"];
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
			process.env[ 'test__redis__port' ] = 6379;
			process.env[ 'test__riak__port' ] = 8087;
			cfg = require( '../src/configya.js' )(
				{
					test: {
						redis: { address: '127.0.0.1', port: 1234 },
						riak: { address: 'riak1', port: 5678 }
					}
				} );
		} );

		after( function() {
			delete process.env[ 'test__redis__port' ];
			delete process.env[ 'test__riak__port' ];
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
} );
