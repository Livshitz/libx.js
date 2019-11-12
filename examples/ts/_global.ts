// Deps & deps config
global.libx = require("../bundles/essentials.js"); // libx is a global helper module
libx.node = require('../node');
// libx.node.catchErrors();
libx.log.isShowStacktrace = false;
libx.log.isShowTime = false;
libx.log.filterLevel = libx.log.filterLevel.debug; libx.log.isDebug = true;
// require('libx.js/modules/network'); // registers network module in libx.di (Dependency Injector)