# configya
Stupid simple configuration.
 
## Use

```javascript
var config = require( 'configya' )( './path/config.json' );

// get the value from the config file,
// if an environment variable is presen
// the environment variable ALWAYS trumps the file setting
config.get( 'key' );

config.get( 'key', defaultValue );
```
