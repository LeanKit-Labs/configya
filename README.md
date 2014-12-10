# configya
Stupid simple configuration.

## What & How
`configya` reads the following:
 * environment variables
 * optional configuration
 * defaults hash

**Note**: you can now provide both a configuration file and a defaults object

Unless you've set a `deploy-type` environment variable = 'DEV', `configya` will always overwrite keys from a configuration file and defaults hash with duplicates found in the environment.

### Key Parsing
`configya` parses all sources into an object hierarchy based on `__` delimited key names. For example, if you have a key named `RABBIT__BROKER__IP` set to '127.0.0.1', and another named `RABBIT__BROKER__PORT` set to 5672, the resulting configuration object will be:

```javascript
{
	rabbit: {
		broker: {
			ip: "127.0.0.1",
			port: "5672"
		}
	}
}
```
**Note**: All keys are lower-cased to eliminate the need for guessing games (and capslock) with the exception of keys with `_` separating words (see below).

Camel case is supported by using a single `_` underscore between words. If you have a key named `SQL__USER_NAME` (notice the single underscore `_`) set to 'siteuser', and another named `SQL__TARGET_SERVER` set to 'localhost', the resulting configuration object will be:

```javascript
{
    sql: {
        userName: "siteuser",
        targetServer: "localhost"
    }
}
```

### Key Prefixing
`configya` lets you specify a prefix for your environment variables to be removed when your configuration is created. For example, if you have an environment variable `LK__RABBIT__BROKER__PORT` set to 5672, and call configya with the `prefix` option `var cfg = require( 'configya' )({prefix:'lk'});`, the resulting configuration object will be:
```javascript
{
    rabbit: {
        broker: {
            port: "5672"
        }
    }
}
```

### Original Keys
The original keys are technically still stored on the object based on their source.
 * \__env__ for original environment keys
 * \__defaults__ for keys coming from a defaults hash
 * \__file__ for keys coming from a file

**Note**: These are really here for diagnostic/backwards compatibility. You shouldn't use/rely on them in your code.

## Usage

```javascript
	//without a config file or defaults (using only environment)
	var cfg = require( 'configya' )();

    //with an environment prefix
    var cfg = require( 'configya' )({prefix: 'lk'});

	//with a config file as well
	var cfg = require( 'configya' )({file: './path/to/configuration.json'});

	//with a defaults hash
	var cfg = require( 'configya' )({
        defaults: { RABBIT__BROKER__PORT: 5672 }
    });

	//with defaults and a config
	var cfg = require( 'configya' )({
        defaults:{
            rabbit: { broker: { port: 5672 } }
        },
        file: './path/to/configuration.json'
    });

	var port = cfg.rabbit.broker.port; // etc.
```

## Backwards Compatibility
The previous version of `configya` accepted multiple arguments of either a string for the file path or an object literal for defaults.
 ```javascript
     //without a config file or defaults (using only environment)
     var cfg = require( 'configya' )();

     //with a config file as well
     var cfg = require( 'configya' )( './path/to/configuration.json' );

     //with a defaults hash
     var cfg = require( 'configya' )( { RABBIT__BROKER__PORT: 5672 } );

     //with defaults and a config (order of args doesn't matter)
     var cfg = require( 'configya' )( { rabbit: { broker: { port: 5672 } } }, './path/to/configuration.json' );

     var port = cfg.rabbit.broker.port; // etc.
 ```

The original version of `configya` used a `get` method to retrieve configuration values with the ability to specify a default/fallback if the key were missing. This is technically still supported, but we think the new approach (nested keys) is nicer. Here's an example of the original API:

```javascript
	var config = require( 'configya' )( './path/config.json' );

	// get the value from the config file, if an
	// environment variable is present the environment
	// variable ALWAYS trumps the file setting unless
	// you have deploy-type=DEV in your env settings
	config.get( 'key' );

	config.get( 'key', defaultValue );
```
