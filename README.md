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
`configya` parses all sources into an object hierarchy based on `_` delimited key names (If camelCase support is desired, see below). For example, if you have a key named `RABBIT_BROKER_IP` set to '127.0.0.1', and another named `RABBIT_BROKER_PORT` set to 5672, the resulting configuration object will be:

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
**Note**: When using a single `_` delimeter, all keys are lower-cased to eliminate the need for guessing games (and capslock)

Camel case is supported when configya detects a double underscore `__` in the key. Once found, `_` will be treated as a word boundary instead of a nesting separator. If you have a key named `SQL__USER_NAME` (notice the single underscore `_` between `USER` and `NAME`) set to 'siteuser', and another named `TARGET_SERVER__` set to 'localhost', the resulting configuration object will be:

```javascript
{
    sql: {
        userName: "siteuser"
    },
    targetServer: "localhost"
}
```

In order to support top level keys with camelCase, you'll need to use a prefix, or start or end your key with `__` (as shown above with `TARGET_SERVER__`).

### Key Prefixing
`configya` lets you specify a prefix for your environment variables to be removed when your configuration is created. For example, if you have an environment variable `LK_RABBIT_BROKER_PORT` set to 5672, and call configya with the `prefix` option `var cfg = require( 'configya' )({prefix:'lk'});`, the resulting configuration object will be:
```javascript
{
    rabbit: {
        broker: {
            port: "5672"
        }
    }
}
```

**Note:** If you are overriding a key that needs camelCase support, be sure to separate your prefix with `__` intead of `_`: `LK__CAMEL_CASE`.

### Value Parsing

Under the hood, configya uses `JSON.parse` to attempt to parse the values so `"true"` and `"false"` will become actual booleans, and `"123"` will be a number.

The following enviroment variables `HOST_CACHE=false HOST_PORT=1234 FONTSIZE=10p` would be parsed as follows:

```javascript
{
    host: {
        cache: false,
        port: 1234
    },
    fontsize: "10p"
}
```

This means you can also use JSON as the value for an environment variable and it will be correctly parsed into an object.

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
        defaults: { RABBIT_BROKER_PORT: 5672 }
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
     var cfg = require( 'configya' )( { RABBIT_BROKER_PORT: 5672 } );

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
