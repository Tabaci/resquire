# resquire

This *npm* module allows the user to perform more advanced requires, functioning 
similarly to namespaces as seen in other programming languages.

## Installation

```javascript
$ npm install resquire
```

## Usage

Before we begin, *resquire* needs to be required: preferably from the root file
of an application or module, as as soon as it has been required, its 
functionality is available from everywhere.

```javascript
require('resquire')
```

### Paths Relative to Root

First and foremost, *resquire* is slightly inspired by 
[rooty](https://www.npmjs.com/package/rooty) and uses a similar syntax for 
requiring files relative to the root. Being able to require files relative to 
the root saves us the nightmare of having to manually type in relative paths.

The default `require` behavior remains the same, whereas all require paths are 
relative to the file they are required from:

```javascript
const utils = require('../../../../../utils')
```

Beyond doubt, this is rarely a prefered behavior. By utilizing the '^' (caret) 
character, files can be required as relative from the root in *resquire*:

```javascript
const utils = require('^utils')
```

The two examples above do the exact same thing (granted we are actually nested 
five levels in away from the root), but the second one is by all means quicker 
and less painful.

### Requiring Multiple Modules at Once

The second, more unique feature *resquire* has to offer, is that multiple 
modules can be required at the same time, given they are located in the same 
directory.

This feature is especially useful if one decides to use the '^' (caret) syntax 
for all requires at all times (thus maintaining consistency).

Through the use of pattern matching, and a curlybrace-styled array in the path 
sent to the `require` function, multiple modules may be loaded and utilized at 
the same time:

```javascript
const [if, else] = require('^tokens/{if, else}')
```

The array returned is filled from left to right from the inputs acquired in the 
curlybrace-styled array from the string. Since it returns an array, the names 
for the pattern matched values do not have to coincide with the names of the 
files.

Furthermore, this feature can be nested:

```javascript
const [if, else, extends] = require('^tokens/{control/{if, else}, template/extends}')
```

As such, all files needed can theoretically be required at the same time, even 
though it most certainly would make a mess of things.

The braces can be used with a require that does not use the '^' (caret) feature.

## License

This module, and the code therein, is licensed under ISC.
