angular.module('ngNavPanels', [])
	.directive('navPanels', function() {
		return {
			restrict: 'E',
			replace: true,
			transclude: true,
			template: '<div class="nav-panels"><main-nav-bar></main-nav-bar><div class="panel-wrapper" ng-transclude></div></div>',
			controller: function($scope, $compile) {
				// Necessary for the directive dependency
				var self = this,
					panels = $scope.panels = {};

				self.state = {
					current: null,
					previous: [],
					depth: 1
				}

				this.select = $scope.select = function(panel, direction) {
					var state = self.state;
					if (typeof panel == 'string') {
						panel = panels[panel];
					}
					direction = direction || 'forward'; // If no direction is set, assume forward

					if (!panel && direction == 'back') {
						panel = self.state.previous[self.state.previous.length - 1];
					}

					if (!panel.selected) {
						replaceNavBar(panel);

						unselectAllPanels();
						// Select the current panel
						panel.selected = true;


						if (direction == 'forward') {
							// If there is already a current panel selected
							if (state.current) {
								state.previous.push(state.current); // Store it as the previous panel

								transitionViews(state.current.elem, panel.elem, direction);
								state.current = panel;
							}
						} else if (direction == 'back') {
							if (state.previous.length) {
								transitionViews(state.current.elem, panel.elem, direction);
								self.state.previous.pop();
								state.current = panel;
							}
						}
					}
				};

				function unselectAllPanels() {
					// Unselect all panels
					for (var key in panels) {
						if (panels.hasOwnProperty(key)) {
							panels[key].selected = false;
						}
					}
				}
				function replaceNavBar(panel) {
					self.$navBar.html('');
					for (var key in panel.navBar) {
						if (panel.navBar.hasOwnProperty(key)) {
							var value = panel.navBar[key];

							if (value) {
								var linkFn = $compile(value),
									html = linkFn($scope);

								self.$navBar.append(html);
							}
						}
					}
				}

				function transitionViews(leavingEle, enteringEle, direction) {
					var step = self.state.depth;

					function setStyles(ele, opacity, x, zIndex) {
						var css = {};
						css.opacity = opacity;
						css['z-index'] = zIndex || '';
						css['transform'] = 'translate3d(' + x + '%,0,0)';
						ele.css(css);
					}

					if (direction == 'forward') {
						setStyles(enteringEle, 1, (1 - step) * 99, 1); // starting at 98% prevents a flicker
						setStyles(leavingEle, (1 - 0.1 * step), step * -33);
					} else if (direction == 'back') {
						setStyles(enteringEle, (1 - 0.1 * (1 - step)), (1 - step) * -33, 1);
						setStyles(leavingEle, 1, step * 100);
					}
				}

				$scope.$navGoBack = function() {
					if (self.state.previous.length) {
						self.select(null, 'back');
					}
				}

				window.navPanels = $scope;

				this.addPanel = function(panel) {
					if (Object.keys(panels).length === 0) {
						panel.seleceted = true;
						self.state.current = panel;
						replaceNavBar(panel);
					}
					panels[panel.key] = panel;
				}
			}
		};
	})
	.directive('mainNavBar', function() {
		return {
			require: '^navPanels',
			restrict: 'E',
			replace: true,
			template: '<nav class="bar-positive bar bar-header"></nav>',
			link: function(scope, elem, attr, panelsCtrl) {
				panelsCtrl.$navBar = elem;
				console.log(panelsCtrl);
			}
		};
	})
	.directive('panel', function() {
		return {
			require: '^navPanels',
			restrict: 'E',
			transclude: true,
			replace: true,
			template: '<section class="panel" ng-transclude></section>',
			scope: {},
			controller: function($scope, $element) {
				// Necessary for the directive dependency
				this.navBar = $scope.navBar = {};

				this.registerNavElement = function(type, html) {
					this.navBar[type] = html;
					return this.navBar[type];
				};
			},
			link: function(scope, elem, attrs, panelsCtrl) {
				scope.key = attrs.state;
				scope.elem = elem;
				panelsCtrl.addPanel(scope);

				setTimeout(function(){
					elem.find('nav-bar').remove();
				});
			}
		};
	})
	.directive('panelContent', function() {
		return {
			require: '^panel',
			restrict: 'E',
			transclude: true,
			replace: true,
			template: '<div class="panel-content" ng-transclude></div>'
		};
	})
	.directive('navBackButton', ['$document', function($document) {
		return {
			require: '^panel',
			restrict: 'E',
			compile: function(tElement, tAttrs) {
				// Helper function
				function hasIconClass(ele) {
					return /ion-|icon/.test(ele.className);
				}

				// clone the back button, but as a <div>
				var buttonEle = $document[0].createElement('button');
				for (var n in tAttrs.$attr) {
					buttonEle.setAttribute(tAttrs.$attr[n], tAttrs[n]);
				}

				if (!tAttrs.ngClick) {
					buttonEle.setAttribute('ng-click', '$navGoBack($event)');
				}

				buttonEle.className = 'button back-button hide buttons ' + (tElement.attr('class') || '');
				buttonEle.innerHTML = tElement.html() || '';

				var childNode;
				var hasIcon = hasIconClass(tElement[0]);
				var hasInnerText;
				var hasButtonText;
				var hasPreviousTitle;

				for (var x = 0; x < tElement[0].childNodes.length; x++) {
					childNode = tElement[0].childNodes[x];
					if (childNode.nodeType === 1) {
						if (hasIconClass(childNode)) {
							hasIcon = true;
						} else if (childNode.classList.contains('default-title')) {
							hasButtonText = true;
						} else if (childNode.classList.contains('previous-title')) {
							hasPreviousTitle = true;
						}
					} else if (!hasInnerText && childNode.nodeType === 3) {
						hasInnerText = !!childNode.nodeValue.trim();
					}
				}

				var defaultIcon = 'icon-back-arrow';
				if (!hasIcon && defaultIcon && defaultIcon !== 'none') {
					buttonEle.innerHTML = '<i class="icon ' + defaultIcon + '"></i> ' + buttonEle.innerHTML;
					buttonEle.className += ' button-clear';
				}

				// if (!hasInnerText) {
				// 	var buttonTextEle = $document[0].createElement('span');
				// 	buttonTextEle.className = 'back-text';

				// 	if (!hasButtonText && $navConfig.backButton.text()) {
				// 		buttonTextEle.innerHTML += '<span class="default-title">' + $navConfig.backButton.text() + '</span>';
				// 	}
				// 	if (!hasPreviousTitle && $navConfig.backButton.previousTitleText()) {
				// 		buttonTextEle.innerHTML += '<span class="previous-title"></span>';
				// 	}
				// 	buttonEle.appendChild(buttonTextEle);
				// }

				tElement.attr('class', 'hide');
				tElement.empty();

				return {
					pre: function($scope, $element, $attr, panelCtrl) {
						// only register the plain HTML, the panelCtrl takes care of scope/compile/link
						panelCtrl.registerNavElement('backButton', buttonEle.outerHTML);
						buttonEle = null;
					}
				};
			}
		};
	}])
	.directive('navTitle', ['$document', function($document) {
		return {
			require: '^panel',
			restrict: 'E',
			compile: function(tElement, tAttrs) {
				var navElementType = 'title';
				var spanEle = $document[0].createElement('span');
				for (var n in tAttrs.$attr) {
					spanEle.setAttribute(tAttrs.$attr[n], tAttrs[n]);
				}
				spanEle.classList.add('nav-bar-title', 'title', 'title-center', 'header-item');
				spanEle.innerHTML = tElement.html();

				tElement.attr('class', 'hide');
				tElement.empty();

				return {
					pre: function($scope, $element, $attrs, panelCtrl) {
						// only register the plain HTML, the panelCtrl takes care of scope/compile/link
						if (panelCtrl) {
	    					panelCtrl.registerNavElement(navElementType, spanEle.outerHTML);
	    				}

						spanEle = null;
					}
				};
			}
		};
	}])
	.directive('navButtons', ['$document', function($document) {
		return {
			require: '^panel',
			restrict: 'E',
			compile: function(tElement, tAttrs) {
				var side = 'right';
	    		if (/^primary|secondary|left$/i.test(tAttrs.side || '')) {
	    			side = tAttrs.side.toLowerCase();
	    		}

				var divEle = $document[0].createElement('div');
	    		divEle.classList.add('buttons', side + '-buttons');
	    		divEle.innerHTML = tElement.html();

	    		var navElementType = side + 'Buttons';

	    		tElement.attr('class', 'hide');
	    		tElement.empty();

	    		return {
	    			pre: function($scope, $element, $attrs, panelCtrl) {
	    				// only register the plain HTML, the panelCtrl takes care of scope/compile/link
	    				if (panelCtrl) {
	    					panelCtrl.registerNavElement(navElementType, divEle.outerHTML);
	    				}

	    				divEle = null;
	    			}
	    		};
			}
		};
	}]);

var app = angular.module('app', ['ngNavPanels']);
app.controller('IndexCtrl', function($scope) {

	var state = {

	}

	$scope.derp = function() {
		console.log('DERP!');
	}

	$scope.state = state;
})