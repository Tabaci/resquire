/**
 * Due to the way Node manages modules, the functionality inside this file will 
 * only ever be run once, even if a user decides to require 'resquire' more than 
 * once.
 */

'use strict'

let path = require('path')
let closestRoot = require('closest-root')
let Module = require('module')

// Private (original) versions of the modified methods
let _require = Module.prototype.require
let _resolveFilename = Module._resolveFilename

/**
 * Modified version of require that allows multiple files located in the same 
 * directory to be included at once.
 */
Module.prototype.require = function (requirePath)
{
	/* Attempt to split the 'requirePath' on a slash preceeded by a curly brace. 
	 * If this split works (there is data in index 1), we know there are 
	 * multiple modules to be required at that location.
	 */
	let requirePathSegments = requirePath.split(/\/(?={)(.*)/)
	let pathGroup = requirePathSegments[1] // The '{}' enclosed group
	
	if (pathGroup !== undefined)
	{
		let groupString = pathGroup.substring(1, pathGroup.length - 1)
		let toRequireArr = splitAtCommasWithLevel(groupString) // To require
		let requirePathDir = requirePath.substring( // The require directory
				0, requirePath.length - pathGroup.length)
		
		// Array to be populated
		let requiredModules = []
		
		for (let i = 0; i < toRequireArr.length; i ++)
		{
			// The current require path
			let curRequirePath = requirePathDir + toRequireArr[i]
			
			/* Set the 'curRequirePath' into the arguments called with, then 
			 * call this modified version of 'require' with that set of 
			 * arguments.
			 */
			arguments[0] = curRequirePath
			
			// The 'requiredModule' might return as an array of modules
			let requiredModule = Module.prototype.require.apply(this, arguments)
			
			if (Array.isArray(requiredModule)) // Returned array
				requiredModules.push.apply(requiredModules, requiredModule)
			else // Single module
				requiredModules.push(requiredModule)
		}
		
		return requiredModules
	}
	else
		return _require.apply(this, arguments)
	
}

/**
 * Splits a string taking the level of the curlybrace-enclosed arrays into 
 * account.
 * 
 * @param {string} string - String to split into multiple parts at commas.
 */
function splitAtCommasWithLevel (string)
{
	let strings = []
	let curString = ''
	let level = 0
	
	for (let i = 0; i < string.length; i ++)
	{
		let c = string[i]
		
		if (c === ' ');
		else if (c === ',' && level === 0)
		{
			strings.push(curString)
			curString = ''
		}
		else
			curString += c
		
		if (c === '{')
			level ++
		else if (c === '}')
			level --
	}
	
	strings.push(curString)
	
	return strings
}

/**
 * Extended version of the Module._resolveFilename. This function transforms 
 * paths with '^' (caret) into paths arising from the root, rather than having 
 * them resolve to a relative location.
 */
Module._resolveFilename = function (
		requiredFile, 
		{ filename: requiredFrom })
{
	if (requiredFile[0] === '^')
	{
		// Trim caret from required file
		requiredFile = requiredFile.substring(1)
		
		// Resolve directory required from
		let requiredFromInfo = path.parse(requiredFrom)
		let requiredFromDir = requiredFromInfo.dir
		
		// Root directory
		let rootDir = closestRoot(requiredFromDir)
		let rootAppend = ''
		
		// Attempt to load configuration
		try
		{
			let resquireConfig = require(rootDir + '/resquire.json')
			
			rootAppend = resquireConfig.root || ''
		}
		catch(err) {
			if (err.code !== 'MODULE_NOT_FOUND')
				throw err
			
			rootAppend = ''
		}
		
		rootDir = path.join(rootDir, rootAppend)
		
		// Resolve path relative to root directory
		let requirePath = path.resolve(rootDir, requiredFile)
		let requirePathInfo = path.parse(requirePath)
		
		if (requirePathInfo.ext === '')
			requirePath += '.js'
		
		return requirePath
	}
	else
		return _resolveFilename.apply(this, arguments)
}
