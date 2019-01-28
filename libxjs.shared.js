// module.id = 'infra';
// module.test = '123';

var isInjectedMode = global._libx != null;

var infra = require('./bundles/essentials.js');

if (!isInjectedMode) {
	var _ = global._;
	try{
		if (_ == null) _ = require('lodash');
		infra._ = _;
	} catch(ex) {
		console.log('infra:init: failed to require lodsash, ex:', ex)
	}
}

var isImportedAsScriptTagOnHtml = ()=> infra._.some(document.getElementsByTagName('script'), i=> i.getAttribute('liv-infra-injected') == '');
if (!isInjectedMode && infra.isBrowser) isInjectedMode = isImportedAsScriptTagOnHtml();

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

infra.isRtl = function(str) {
	var XRegExp = infra.require('//shared.feedox.com/scripts/lib/xregexp-all.min.js')

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
	infra.log.verbose('Latin score: ' + partLatin);
	infra.log.verbose('Hebrew score: ' + partHebrew);
	infra.log.verbose('trlIndex score: ' + rtlIndex);
	infra.log.verbose('isRTL: ' + isRTL);
	*/

	return isRTL;
}

/* =========== [ /	\ ] =========== */


// Meant to avoid changing primitives and interfere with other code
if (!isInjectedMode) {
	// infra.applyExtensions();

	if (global.liv == null) global.liv = {};
	global.libx.infra = infra.extend(infra, global.infra);
	global.infra = global.liv.infra;
	module.exports = global.infra;
} else {
	if (global._libx == null) global._libx = {};
	global._libx.infra =  infra.extend(infra, global._libx.infra);

	exports = infra;
}

console.log('infra: infra is ready', isInjectedMode)


// if (global.liv.infra.autoApply != false) infra.applyExtensions();