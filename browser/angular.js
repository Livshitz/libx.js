module.exports = (function(){
	var mod = {};
	const libx = require('../bundles/browser.essentials');

	mod.init = ()=> {
		mod = angular.module('libx.angular', ['ngResource', 'ngRoute']);
	
		mod.factory('utils', ($rootScope, $window, $resource, $q, $timeout, $location, $http) => {
			var service = {};
			return mod;
		});
	
		//#region Basics
		mod.bootstrap = (appModuleName, rootElm)=> {
			mod.rootElm = rootElm;
			if (window._libx_angular_boot) throw "angular was already bootstrapped!";
			window._libx_angular_boot = true;

			libx.log.verbose('libx.angular.bootstrap');
			var loader = ()=> {
				libx.log.verbose('libx.angular.bootstrap: loader');
				mod.injector = angular.bootstrap(rootElm || document.body.parentNode, [appModuleName || 'myApp']);
			}
			loader();
			angular.element(window).on('load', ()=> {
				libx.log.verbose('libx.angular.bootstrap: load');
			});
		};
	
		window.ngInjector = function () {
			var ret = mod.injector || angular.element(mod.rootElm || document.body.parentNode).injector(); 
			//angular.injector(['ng']); //.invoke(($window)=> libx.log.v($window.origin));
			// angular.element('body').injector();
			if (ret == null) throw 'angular is not ready yet'; // ret = angular.injector(['ng']);
			return ret;
		};
		window.ngGet = (getModule) => window.ngInjector().get(getModule);
		window.ngScopeInline = function() { return angular.element('[ng-controller="inlineController"]').last().scope() };
		window.scope = window.ngScopeInline();
		mod.do = (func, reqModules)=> window.ngInjector(reqModules).invoke(func);
		mod.get = (instanceName) => window.ngGet(instanceName);
		// mod.onReady2 = (func) => angular.element('body').ready(func);
	
		mod.config(()=>{
			libx.log.verbose('libx.angular: config');
		});

		// Self init stuff:
		mod.run(()=>{
			mod.history = [];
			// mod.fixRouteSensitivity();
			// mod.initScreenSizeDirectives();
		});
	
		mod.run(($rootScope, $window, $resource, $q, $timeout, $location, $http)=>{
			libx.log.verbose('libx.angular: run');

			$rootScope.libx = {};
			$rootScope.libx.browser = libx.browser;
	
			mod.$window = $window;
			mod.$rootScope = $rootScope;
	
			mod.broadcast = (eventName) => $rootScope.$broadcast(eventName);
			mod.on = (eventName, func) => $rootScope.$on(eventName, func);
			mod.onReady = (func) => { 
				if (!mod.ngReady) mod.on('ng-ready', func);
				else func.call(); //mod.do(func);
			}
	
			mod.broadcast("ng-ready");
			mod.ngReady = true;
			
			$rootScope.trustSrc = function (src) {
				return $sce.trustAsResourceUrl(src);
			};
	
			$rootScope.safeApply = function (scope) {
				scope = scope || $scope;
	
				var phase = (this.$root || $rootScope).$$phase;
				if (phase != '$apply' && phase != '$digest') {
					this.$apply();
				}
			};
	
			$rootScope.$on('$routeChangeSuccess', function ($event) {
				libx.log.verbose('$routeChangeSuccess');
				$rootScope.hasBack = function () {
					return mod.history.length > 1 && mod.history[mod.history.length - 1] != '/'; // $location.$$path != '/' &&
				};
	
				mod.history.push($location.$$path);
			});
	
			$rootScope.$on('$viewContentLoaded', function () {
				libx.log.verbose('$viewContentLoaded', $location.$$path);
				try{
					if ($window.ga != null) $window.ga('send', 'pageview', { page: $location.path() });
				}
				catch(ex) {
				}
				window.ngScope = angular.element('[ng-view]').scope();
	
				// mod.autoNameInputs();
	
				window.$scope = window.ngScopeInline();
			});
	
			mod.ngRefresh = function(elmQuery) {
				if (libx.isNull(elmQuery)) elmQuery = "body";
				var scope = angular.element(elmQuery).scope();
				var compile = angular.element(elmQuery).injector().get('$compile');
			
				compile($(elmQuery).contents())(scope);
				scope.$apply();
			}

			mod.goBack = function () {
				libx.log.verbose('goBack');
				var cur = $location.path();
		
				var prevUrl = "/";
				do{
					prevUrl = mod.history.length > 1 ? mod.history.splice(-2)[0] : "/";
				}while(prevUrl == cur || mod.history.length <= 0);

				// if (!app.isHtml5Mode) prevUrl = '/#!' + prevUrl;
		
				$location.path(prevUrl);
				$rootScope.safeApply();
			}
		});
	
		// Lazy
		mod.config(function ($controllerProvider, $compileProvider, $filterProvider, $provide) {
			mod.lazy = {
				controller: $controllerProvider.register,
				directive: $compileProvider.directive,
				filter: $filterProvider.register,
				factory: $provide.factory,
				service: $provide.service
			};
		});

		mod.applyLazy = (_module) => {
			_module.config(($controllerProvider, $compileProvider, $filterProvider, $provide)=> {
				_module.lazy = {};
				_module.lazy.controller = $controllerProvider.register;
				_module.lazy.directive = $compileProvider.directive;
				_module.lazy.filter = $filterProvider.register;
				_module.lazy.factory = $provide.factory;
				_module.lazy.service = $provide.service;
			})
			return _module.lazy;
		}

		//#region Controllers
		mod.controller('inlineControllerBase', function ($scope, $rootScope) {
			window.$scope = ngScopeInline();
			window.$rootScope = $rootScope;
			$scope.app = app;
			$scope.root = $rootScope;
		});
		//#endregion
	
		// allow DI for use in controllers, unit tests. use in views, ng-repeat="x in _.range(3)"
		mod.constant('_', window._).run(function ($rootScope) {
			$rootScope._ = window._;
		});
	
		//#endregion
	
		//#region Helpers
		mod.isRoot = () => $location.path() == '/'
		mod.resetSearch = ()=> mod.navigate(null, {});
	
		mod.tryGetComponentName = (moduleUri, _default) => {
			try {
				if (moduleUri == null) throw '';
				var ret = moduleUri.match(/([^\/]+?)\/[^\/]+\.js$/)[1].camelize();;
				if (ret == null || ret == '') throw '';
				return ret;
			} catch(ex) {
				if (_default == null) throw "tryGetComponentName: Can't define component name!";

				return _default;
			}
		}
	
		mod.isActive = function(path, isExact) {
			if (isExact) {
				if ($location.path() == path) return true;
				else return false;
			}
	
			if ($location.path().substr(0, path.length) == path) {
				return true;
			} else {
				return false;
			}
		},
	
		mod.fixUrl = function(url) {
			var startOfUrl = url.slice(0,10);
			var restOfUrl = url.slice(10);
			restOfUrl = restOfUrl.replace(/\/+/g, '/')
			url = startOfUrl + restOfUrl;
	
			var isAbsoluteUrl = url.contains("//");
			url = _fd.h.cleanUrl((!isAbsoluteUrl ? app.backendUrl : "") + url)
			
			return url;
		}
	
		mod.getJson = function (endpoint, data, success) {
			var url = mod.fixUrl(endpoint);
			// Using YQL and JSONP
			return $.ajax({
				dataType: "json",
				url: url,
				data: data,
				success: success
			});
		};
	
		mod.httpGet = function (endpoint, exHeaders) {
			var url = mod.fixUrl(endpoint);
			return api.shared.network.httpGet(endpoint, { headers: exHeaders });
	
			return $.ajax({
				type: "GET",
				headers: { 'token': app.token },
				url: url,
				contentType: "application/json",
				// crossDomain: true,
				//processData: false,
				//success: function(msg) {
				//	$("#results").append("The result =" + StringifyPretty(msg));
				//}
			});
		};
	
		mod.httpPostJson = function (endpoint, data, exHeaders) {
			libx.extend(exHeaders, { 'Content-Type': 'application/json; charset=UTF-8' });
			return mod.httpPost(endpoint, data, { headers: exHeaders });
		}
	
		mod.httpPost = function (endpoint, data, exHeaders) {
			var url = mod.fixUrl(endpoint);
			return api.shared.network.httpPost(endpoint, data, { headers: exHeaders });
	
			return $.ajax({
				type: "POST",
				headers: {
					'token': app.token
					//'Content-Type':'application/x-www-form-urlencoded'
				},
				url: url,
				data: JSON.stringify(data), //escape(JSON.stringify(data)),
				contentType: "application/json"
				//processData: false,
				//success: function(msg) {
				//	$("#results").append("The result =" + StringifyPretty(msg));
				//}
			});
		};
	
		mod.downloadFile = function(url, cb) {
			var xhr = new XMLHttpRequest();
			// xhr.responseType = 'blob';
			xhr.responseType = 'arraybuffer';
			xhr.onload = function(event) {
				var blob = xhr.response;
				cb(blob);
			};
			xhr.open('GET', url);
			xhr.send()
		}
	
		mod.downloadText = function(url, cb) {
			mod.downloadFile(url, (byteArr)=> {
				var str = Buffer(byteArr).toString();
				cb(str);
			})
		};
	
		mod.httpUploadFile = function (endpoint, d) {
			return $.ajax({
				type: "POST",
				headers: { 'token': app.token },
				url: _fd.h.cleanUrl(app.backendUrl + endpoint),
				data: d,
				async: true,
				cache: false,
				contentType: false,
				processData: false
			});
		};
	
		mod.generateDownload = function(filename, content, type) {
			//if(!contentType) contentType = 'application/octet-stream';
			var a = document.createElement('a');
			var blob = new Blob([content], {'type': type});
			a.href = window.URL.createObjectURL(blob);
			a.download = filename;
			a.click();
		}
	
		mod.scrollToTop = function () {
			var toolbar = $('md-toolbar:first').height();
			var curY = $(window).scrollTop();
			var scrollTo = toolbar - 5;
	
			if (curY <= toolbar) scrollTo = 0;
	
			$("html, body").animate({scrollTop: scrollTo}, "fast");
		}
	
		mod.navigate = (url, params)=> { 
			var l = url || ngGet('$location').path();
			var ret = ngGet('$location').path(l, params); 
			ngGet('$rootScope').safeApply(); 
			return ret;
		};
	
		// Fix route case sensitivity
		mod.fixRouteSensitivity = () => {
			'use strict';
	
			mod.config(config);
			config.$inject = ['$provide'];
	
			function config($provide) {
				$provide.decorator("$route", extendRouteProvider);
				extendRouteProvider.$inject = ['$delegate'];
	
				function extendRouteProvider($delegate) {
					Object.keys($delegate.routes)
							.forEach(function (route) {
								if (!!$delegate.routes[route].regexp) {
									var routeRegex = $delegate.routes[route].regexp.source;
									// Make regex case insensitive
									$delegate.routes[route].regexp = new RegExp(routeRegex, 'i');
									// Add caseInsensitiveMatch property in route as true
									$delegate.routes[route]['caseInsensitiveMatch'] = true;
								}
							});
					return $delegate;
				}
			}
		}
	
		//#endregion
	
		//#region UI Helpers

		mod.showPrompt = function(title, callback, options) {
			// Appending dialog to document.body to cover sidenav in docs app
			var p = libx.newPromise();
			var options = options || {};
			var $mdDialog = ngGet('$mdDialog');
			var confirm = $mdDialog.prompt()
				.title(title)
				.textContent(options.content)
				.placeholder(options.placeholder)
				//- .ariaLabel('Dog name')
				.initialValue(options.initialValue)
				// .targetEvent(ev)
				.required(options.required || true)
				.ok(options.ok || 'Ok')
				.cancel(options.cancel || 'Cancel');

			$mdDialog.show(confirm).then(async (result)=>{
				if (callback) callback(result);
				p.resolve(result);
			}, function() {
				if (callback) callback(null);
				p.resolve(null);
			});
			return p;
		};

	
		mod.showDialog = function (dialogName, dialogTemplate, dlg, locals, showCloseButton) {
			mod.lazy.controller(dialogName, function ($scope, $mdDialog, locals) {
				$scope.hide = function () {
					//libx.log.verbose('Dialog:' + dialogName + ': Hidel!');
					//$('.md-dialog-container').hide();
					//$mdDialog.hide();
					$mdDialog.cancel();
				};
				$scope.cancel = function () {
					libx.log.verbose('Dialog:' + dialogName + ': Cancel!');
					if ($scope.locals.onClose != null) $scope.locals.onClose();
					$mdDialog.cancel();
				};
	
				$scope.locals = locals;
	
				//ngInjector().invoke(dlg, $scope)
				dlg($scope);
			});
	
			return {
				locals: locals,
				show: function(extraLocals) {
					var _locals = Object.assign({}, locals); // make shallow copy, by value
					jQuery.extend(_locals, extraLocals);
	
					if (showCloseButton) ngGet('$rootScope').showFloatingBackButton = true;
					
					// Hack to solve the not-appearing dialog
					setTimeout(function() { $(window).resize(); }, 100);
					setTimeout(function() { $(window).resize(); }, 500);
					setTimeout(function() { $(window).resize(); }, 2000);
	
					ngGet('$mdDialog').show({
						controller: dialogName,
						templateUrl: dialogTemplate,
						locals: _locals,
						clickOutsideToClose: true,
						escapeToClose: true
					}).then(function (answer) {
						libx.log.verbose('Dialog:' + dialogName + ': dialog successfull');
						ngGet('$rootScope').showFloatingBackButton = false;
					}, function () {
						if ($scope.locals != null && $scope.locals.onClose != null) $scope.locals.onClose();
						libx.log.verbose('Dialog:' + dialogName + ': dialog cancelled');
						ngGet('$rootScope').showFloatingBackButton = false;
					});
				},
				hide: function hide() {
					ngGet('$mdDialog').hide();
					ngGet('$rootScope').showFloatingBackButton = false;
				}
			};
		};
	
		mod.hideDialog = function () {
			ngGet('$mdDialog').hide();
		};
	
		mod.reload = function() {
			ngGet('$window').location.reload();
		}
	
		mod.autoNameInputs = function(){
			//libx.log.verbose('autoNameInputs')
			$('input[ng-model]').each(function (i, x) {
				var elm = $(x);
				if (elm.attr('name') != null) return;
				elm.attr('name', elm.attr('ng-model'));
			});
		},
	
		mod.toast = (msg, type, pos, delay)=> {
			pos = pos || "bottom right";
			type = type || 'normal'; // success | error
	
			var icon = '';
			switch(type) {
				case 'error': icon = 'warning'; break;
				case 'success': icon = 'check_circle'; break;
			}
	
			delay = delay || 3000;
			var $mdToast = ngGet('$mdToast');
			$mdToast.show({
				template: '<md-toast class="md-toast ' + type +'"><i class="md-icons">' + icon + "</i>&nbsp;" + msg + '</md-toast>',
				hideDelay: delay,
				paren: angular.element('.layout-content'),
				position: pos
				// textContent: ''
			});
		}
	
		mod.setEditInPlaceStuff = function() {
			mod.setEditInPlaceToAutoSelect = function() {
				$('.ng-inline-edit').on('click', function(ev) { 
					var input = $(ev.currentTarget).find('input')[0];
					if (input == null) return;
					input.setSelectionRange(0, input.value.length)
				});
			}();
	
			mod.setEditInPlaceTabNext = function() {
				$('.ng-inline-edit').on('focus', '.ng-inline-edit__text', function(ev) { 
					libx.log.verbose('x', ev)
					var input = ev.currentTarget 
					if (input == null) return;
					input.click();
				});
			}();
		}
	
		mod.initScreenSizeDirectives = () => {
			mod.screenModes = {
				Xs: '(max-width: 599px)',
				GtXs: '(min-width: 600px)',
				Sm: '(min-width: 600px) and (max-width: 959px)',
				GtSm: '(min-width: 960px)',
				Md: '(min-width: 960px) and (max-width: 1279px)',
				GtMd: '(min-width: 1280px)',
				Lg: '(min-width: 1280px) and (max-width: 1919px)',
				GtLg: '(min-width: 1920px)',
				Xl: '(min-width: 1920px)'
			}; // xs, gt-xs, sm, gt-sm, md, gt-md, lg, gt-lg, xl
	
			jQuery(window).on('resize', function () {
				_.each(mod.screenModes, function (value, key) {
					mod.$rootScope["is" + key] = window.matchMedia(value).matches;
				});
			});
			jQuery(window).trigger('resize');
	
			mod.$window.onresize = function (event) {
				mod.$rootScope.safeApply();
			}
	
			function resizeFunc($window, $scope, $elm, $attr, event) {
				var clientWidth = document.documentElement.clientWidth;
				libx.log.verbose('resizeFunc');
	
				_.each(mod.screenModes, function (value, key) {
					if ($window.matchMedia(value).matches) {
						$elm.addClass($attr['class' + key]);
					} else {
						$elm.removeClass($attr['class' + key]);
					}
				});
			}
	
			_.each(mod.screenModes, function (value, key) {
				mod.directive('class' + key, function ($window) {
					return {
						restrict: 'AE',
						link: function link($scope, $elm, $attr) {
							$window.onresize = function (event) {
								resizeFunc($window, $scope, $elm, $attr, event);
							};
	
							$window.onresize();
						}
					};
				});
	
				mod.directive('is' + key, function ($window) {
					return {
						restrict: 'AE',
						link: function link($scope, $elm, $attr) {
							$window.onresize = function (event) {
								_.each(mod.screenModes, function (value, key) {
									if ($window.matchMedia(value).matches) {
										ngGet('$parse')($attr['is' + key])($scope);
									} else {}
								});
							};
	
							$window.onresize();
						}
					};
				});
			});
		}
	
		//#endregion
	
		//#region Extensions
		mod.filter('formatTimer', function () {
			return function (input) {
				function z(n) { return (n < 10 ? '0' : '') + n; }
				var seconds = input % 60;
				var minutes = Math.floor(input % 3600 / 60);
				var hours = Math.floor(input / 3600);
				return (z(hours) + ':' + z(minutes) + ':' + z(seconds));
			};
		});
	
		mod.filter('moment', function() {
			return function(input) {
				return moment(input).fromNow();
			};
		});
	
		mod.filter('ellipsis', function() {
			return function(input, maxLength) {
				if (input.length > maxLength) {
					input = input.substr(0, maxLength);
					input += '...';
				}
				return input;
			};
		});
	
		mod.directive('goClick', function ($location) {
			return function (scope, element, attrs) {
				var path;
	
				attrs.$observe('goClick', function (val) {
					path = val;
				});
	
				element.bind('click', function () {
					scope.$apply(function () {
						$location.path(path);
					});
				});
			};
		});
	
		mod.directive('ngToggle', function ($location) {
			return function (scope, element, attrs) {
				var path;
	
				attrs.$observe('ngToggle', function (val) {
					path = val;
				});
	
				element.bind('click', function () {
					scope.$apply(function () {
						libx.log.verbose(scope);
						libx.log.verbose(attrs['ngToggle']);
						libx.log.verbose(scope.$eval( attrs['ngToggle'] ) );
						scope.$eval( attrs['ngToggle'] + '=!' + attrs['ngToggle']  )
					});
				});
			};
		});
	
		mod.directive('autofocus', ['$timeout', function ($timeout) {
			return {
				restrict: 'A',
				link: function ($scope, $element, attrs) {
					if (attrs != null && attrs['autofocus'] != null) {
						var trigetElm = angular.element(attrs['autofocus'])
						var isSelectAll = _.has(attrs, 'autofocusSelect');

						trigetElm.bind('click', function() {
							libx.log.debug('autofocus-click', trigetElm[0], $element[0]);
							$element[0].blur();
							$timeout(function () {
								$element[0].focus();
								if(isSelectAll) $element[0].select();
							}, 100);
						});
					} else {
						$timeout(function () {
							libx.log.debug('autofocus', $element[0]);
							$element[0].focus();
						}, 500);
					}
				}
			}
		}]);

		mod.directive("contenteditable", function () {
			return {
				restrict: "A",
				require: "ngModel",
				link: function (scope, element, attrs, ngModel) {
					// read is the main handler, invoked here by the blur event
					function read() {
						// Keep the newline value for substitutin when cleaning the <br>
						var text = element.html();
						if (!isNaN(text)) {
							text = eval(text);
						}
						else if (text.indexOf("<br>") > -1) {
							var newLine = String.fromCharCode(10);
							// Firefox adds a <br> for each new line, we replace it back to a regular '\n'
							text = text.replace(/<br>/ig,newLine).replace(/\r/ig,'');
						}
						// update the model
						ngModel.$setViewValue(text);
						// Set the formated (cleaned) value back into the element's html.
						element.text(text);
					}
	
					ngModel.$render = function () {
						element.html(ngModel.$viewValue !== null ? ngModel.$viewValue : "");
					};
	
					element.bind("blur", function () {
						// update the model when we loose focus
						scope.$apply(read);
					});
					element.bind("paste", function(e){
						// This is a tricky one when copying values while editing, the value might be copied with formatting, 
						// for example <span style="line-height: 20px">copied text</span> to overcome this, we replace the default behavior and 
						// insert only the plain text that's in the clipboard
						e.preventDefault();
						document.execCommand('inserttext', false, (e.clipboardData || e.originalEvent.clipboardData).getData('text/plain'));
					});
				}
			};
		});
	
		mod.factory('page', function () {
			var title = '';
			var appName = '';
			return {
				setAppName: function(name, defaultTitle) { appName = name; title = defaultTitle; },
				title: function () { return appName + " | " + title; },
				setTitle: function (newTitle) { title = newTitle },
				desc: '',
				image: ''
			};
		});
	
		mod.filter("trustUrl", ['$sce', function ($sce) {
			return function (recordingUrl) {
				return $sce.trustAsResourceUrl(recordingUrl);
			};
		}]);
	
		mod.filter("addParam", function () {
			return function (url, newParam) {
				if (url == null) return null;
				var hasQ = url.indexOf('?') > -1;
				return url + (hasQ ? "&" : "?") + newParam;
			};
		});
	
		mod.filter('escape', function () {
			return window.encodeURIComponent;
		});
	
		mod.filter('escape2', function () {
			return function (url) {
				libx.log.verbose(url);
				url = url.replace(/\//g, '*');
				return window.encodeURIComponent(url);
			};
		});
	
		mod.directive('disallow', function($parse) {
			return {
				require: 'ngModel',
				restrict: 'A',
				link: function(scope, element, attrs, modelCtrl) {
					// var pattern = $parse(attrs.noSpecialChar)(scope);
					var pattern = attrs.disallow;
					// libx.log.verbose('strict: pattern= ', pattern);
	
					modelCtrl.$parsers.push(function(inputValue) {
						if (inputValue == null) return '';
	
						cleanInputValue = inputValue.replace(new RegExp(pattern, 'gi'), '');
						if (cleanInputValue != inputValue) {
							modelCtrl.$setViewValue(cleanInputValue);
							modelCtrl.$render();
						}
						return cleanInputValue;
					});
				}
			};
		});
	
		mod.directive('focusOn', function() {
			return function(scope, elem, attr) {
			scope.$on('focusOn', function(e, name) {
				if(name === attr.focusOn) {
				elem[0].focus();
				}
			});
			};
		});
	
		mod.directive('strict', function($parse) {
			return {
				require: 'ngModel',
				restrict: 'A',
				link: function(scope, element, attrs, modelCtrl) {
					var pattern = attrs.strict;
					// libx.log.verbose('strict: pattern= ', pattern);
	
					element.on('keypress', function(event) { 
						// libx.log.verbose('creditCardFormatter: key= ', event.key);
	
						var value = event.target.value + event.key;
						// value.replace(new RegExp(pattern, 'gi'), '');
						var isNoMatch = value.match(new RegExp(pattern, 'gi'), '') == null;
						
						if (isNoMatch) { 
							event.preventDefault();
							return;
						}
					});
				}
			};
		});
	
		mod.directive('spacer', function($parse) {
			return {
				require: 'ngModel',
				restrict: 'A',
				link: function(scope, element, attrs, modelCtrl) {
					modelCtrl.$parsers.push(function(inputValue) {
						if (inputValue == null) return '';
						var spaceEach = parseInt(attrs.spacer);
						var spaceChar = attrs.spacerChar || ' ';
	
						cleanInputValue = inputValue.replace(new RegExp("\\D", 'gi'), '');
	
						// libx.log.verbose('spacer: val= ', cleanInputValue)
						var initialString = cleanInputValue;
						for(var i=spaceEach; i<initialString.length; i+=spaceEach) {
							var position = i + (i/spaceEach - 1);
							cleanInputValue = [cleanInputValue.slice(0, position), cleanInputValue.slice(position)].join(spaceChar);
						}
	
						if (cleanInputValue != inputValue) {
							modelCtrl.$setViewValue(cleanInputValue);
							modelCtrl.$render();
						}
						return cleanInputValue;
					});
				}
			};
		});
	
		mod.filter('ellipsis', function() {
			return function(input, total) {
			if (input.length > total) {
				return (input.slice(0, total) + "...");
			}
			return (input);
			}
		});
	
		mod.filter('myCurrency', ['$filter', function ($filter) {
			return function (input) {
				input = parseFloat(input);
				input = input.toFixed(input % 1 === 0 ? 0 : 2);
				return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			};
		}]);
	
		mod.filter('int', function ($filter) {
			return function (number, pre) {
				return number.toFixed(pre);
			};
		});
	
		mod.filter('mask', function ($filter) {
			return function (text, disable) {
				if (disable) return text;
				var w = CryptoJS.enc.Utf8.parse(text);
				return CryptoJS.enc.Base64.stringify(w);
			};
		});
	
		mod.directive('includeReplace', function () {
			return {
				require: 'ngInclude',
				restrict: 'A', /* optional */
				link: function link(scope, el, attrs) {
					el.replaceWith(el.children());
				}
			};
		});
	
		mod.directive('format', ['$filter', function ($filter) {
			return {
				require: '?ngModel',
				link: function link(scope, elem, attrs, ctrl) {
					if (!ctrl) return;
	
					ctrl.$formatters.unshift(function (a) {
						return $filter(attrs.format)(ctrl.$modelValue);
					});
	
					elem.bind('blur', function (event) {
						var plainNumber = elem.val().replace(/[^\d|\-+|\.+]/g, '');
						elem.val($filter(attrs.format)(plainNumber));
					});
				}
			};
		}]);

		mod.directive("ngSubApp", function() {
			return {
				"scope" : {},
				"restrict" : "AEC",
				"compile" : function(element, attrs) {
					// removing body
					var html = element.html();
					element.html('');
					return function(scope, element) {
						// destroy scope
						scope.$destroy();
						// async
						setTimeout(function() {
							// prepare root element for new app
							var newRoot = document.createElement("div");
							newRoot.innerHTML = html;
							// bootstrap module
							angular.bootstrap(newRoot, [attrs["ngSubApp"]]);
							// add it to page
							element.append(newRoot);
						});
					}
				}
			}
		});

		//#endregion
	
		
	};

	if (typeof angular == "undefined") libx.log.debug('libx.angular: Angular is not defined, skipping Angular libx setup...');
	else mod.init();

	return mod;
})();