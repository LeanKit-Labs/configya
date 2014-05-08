require( 'should' );

describe( 'when loading config that doesn\'t exist', function() {
	var cfg = require( '../src/configya.js' )( './spec/non-existant.json' );

	it( 'should return nothing', function() {
		( cfg.get( 'thing' ) == undefined ).should.be.true;
	} );
} );

describe( 'when loading valid config without environment variables', function() {
	var cfg = require( '../src/configya.js' )( './spec/test.json' );

	it( 'missing key should be missing', function() {
		( cfg.get( 'thing' ) == undefined ).should.be.true;
	} );

	it( 'missing key should return default', function() {
		cfg.get( 'thing', ':(' ).should.equal( ':(' );
	} );

	it( 'valid key should return value', function() {
		cfg.get( 'test-key' ).should.equal( 'hulloo' );
	} );
} );


describe( 'when loading valid config with environment variables', function() {
	var cfg = require( '../src/configya.js' )( './spec/test.json' );

	before(function() {
		process.env[ 'missing-from-config' ] = 'env';
		process.env[ 'override-me' ] = 'OVERRIDE!';
	});

	describe( 'with no deploy-type environment var set', function() {
		it( 'missing key should be missing', function() {
			( cfg.get( 'thing' ) == undefined ).should.be.true;
		} );

		it( 'missing key should return default', function() {
			cfg.get( 'thing', ':(' ).should.equal( ':(' );
		} );

		it( 'environment key should return value', function() {
			cfg.get( 'missing-from-config' ).should.equal( 'env' );
		} );

		it( 'environment key should override config key', function() {
			cfg.get( 'override-me' ).should.equal( 'OVERRIDE!' );
		} );

	})

	describe( 'with deploy-type set to DEV for testing', function () {

		before(function() {
			process.env[ 'deploy-type' ] = 'DEV';
		});

		it( 'missing key should be missing', function() {
			( cfg.get( 'thing' ) == undefined ).should.be.true;
		} );

		it( 'missing key should return default', function() {
			cfg.get( 'thing', ':(' ).should.equal( ':(' );
		} );

		it( 'environment key should return value', function() {
			cfg.get( 'missing-from-config' ).should.equal( 'env' );
		} );

		it( 'config key should override environment key', function() {
			cfg.get( 'override-me' ).should.equal( "you will see this only when you have deploy-type set to 'DEV'" );
		} );

	})
	after( function() {
		process.env[ 'missing-from-config' ] = '';
		process.env[ 'test-key' ] = '';
		process.env[ 'deploy-type' ] = '';
	} );
} );