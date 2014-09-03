require('should');

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

    after( function() {
      delete process.env[ 'missing_from_config' ];
      delete process.env[ 'override-me' ];
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

      after( function() {
        delete process.env[ 'deploy-type' ];
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

  } );
} );
