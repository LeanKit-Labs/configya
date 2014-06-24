# configya
Stupid simple configuration.

##What & How
`configya` reads your environment variables as well as an optional configuration file (you provide the path, in that case), and returns a configuration object to you.

###Environment Variables
`configya` will parse your environment variables into an object hierarchy if you use underscores to delimit them. For example, if you have an environment variable called `RABBIT_BROKER_IP` set to "127.0.0.1", and another one called `RABBIT_BROKER_PORT` (set to 5672), they will be parsed to this representation:


	{
		rabbit: {
			broker: {
				ip: "127.0.0.1",
				port: "5672"
			}
		}
	}


Notice that the environment variables are transformed to lower case as well.

By default, configya will prefer to use your environment variables. If you provide a config file as well, it will still prefer environment variables unless you add this to your environment variables: `deploy-type=DEV`. With `deploy-type` set to DEV, `configya` will use values from your config file, *if they exist*, before an environment variable.
 
## Usage

	//load configya without a config file (using only environment)
	var cfg = require('configya')();

	//load configta with a config file as well
	var cfg = require('configya')('./path/to/configuration.json');

	var port = cfg.rabbit.broker.port; // etc.


For the oddball edge case(s), the environment variables are also available on `configya` in an un-transformed state:


	// This isn't how you want to get at your config data....
	var port = cfg.__env__.RABBIT_BROKER_PORT;


## Backwards Compatibility

The original version of `configya` (v0.0.3) used a `get` method to retrieve configuration values. This is technically still supported, though we recommend using the approach described above. Here's a usage example based on the older API:


	var config = require( 'configya' )( './path/config.json' );

	// get the value from the config file, if an 
	// environment variable is present the environment
	// variable ALWAYS trumps the file setting unless 
	// you have deploy-type=DEV in your env settings
	config.get( 'key' );

	config.get( 'key', defaultValue );

