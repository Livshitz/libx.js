// module.id = 'libx';
// module.test = '123';

var isInjectedMode = global._libx != null;

var libx = require('./bundles/essentials.js');

if (!isInjectedMode) {
	var _ = global._;
	try{
		if (_ == null) _ = require('lodash');
		libx._ = _;
	} catch(ex) {
		libx.log.e('libx:init: failed to require lodsash, ex:', ex)
	}
}

var isImportedAsScriptTagOnHtml = ()=> libx._.some(document.getElementsByTagName('script'), i=> i.getAttribute('liv-libx-injected') == '');
if (!isInjectedMode && libx.isBrowser) isInjectedMode = isImportedAsScriptTagOnHtml();

/* =========== [ Things: ] =========== */
//#region Things

if (typeof global === 'undefined' || global == null) { 
	// In browser:
	window.global = window;
} else {
	// In Node:
}


//#endregion
/* =========== [ Extensions: ] =========== */

/* =========== [ Helpers: ] =========== */

libx.isRtl = function(str) {
	var XRegExp = libx.require('//shared.feedox.com/scripts/lib/xregexp-all.min.js')

	var isHebrew = XRegExp('[\\p{Hebrew}]');
	var isLatin = XRegExp('[\\p{Latin}]');
	var partLatin = 0;
	var partHebrew = 0;
	var rtlIndex = 0;
	var isRTL = false;

	if (str == null || str.length == 0) return false;

	for(i=0;i<str.length;i++){
		if(isLatin.test(str[i]))
			partLatin++;
		if(isHebrew.test(str[i]))
			partHebrew++;
	}
	rtlIndex = partHebrew/(partLatin + partHebrew);
	if(rtlIndex > .5) {
		isRTL = true;
	}
	/*
	libx.log.verbose('Latin score: ' + partLatin);
	libx.log.verbose('Hebrew score: ' + partHebrew);
	libx.log.verbose('trlIndex score: ' + rtlIndex);
	libx.log.verbose('isRTL: ' + isRTL);
	*/

	return isRTL;
}

/* =========== [ /	\ ] =========== */


// Meant to avoid changing primitives and interfere with other code
if (!isInjectedMode) {
	// libx.applyExtensions();

	if (global.liv == null) global.liv = {};
	global.libx = libx.extend(libx, global.libx);
	// global.libx = global.liv.libx;
	module.exports = global.libx;
} else {
	if (global._libx == null) global._libx = {};
	global._libx.libx =  libx.extend(libx, global._libx);

	exports = libx;
}

libx.log.i('libx: libx is ready', isInjectedMode)


// if (global.libx.autoApply != false) libx.applyExtensions();