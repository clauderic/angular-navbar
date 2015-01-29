var app = angular.module('app', ['ngSanitize'])

app.controller('IndexCtrl', function($scope) {

	var state = {

	}

	$scope.derp = function() {
		console.log('DERP!');
	}

	$scope.state = state;
})
.directive('navPanels', function() {
	return {
		restrict: 'E',
		replace: true,
		transclude: true,
		template: '<div class="nav-panels"><main-nav-bar></main-nav-bar><div class="panel-wrapper" ng-transclude></div></div>',
		controller: function($scope, $sce, $compile) {
			// Necessary for the directive dependency
			var that = this,
				panels = $scope.panels = {};

			this.select = $scope.select = function(panel) {
				if (typeof panel == 'string') {
					panel = panels[panel];
				}

				// Unselect all panels
				for (var key in panels) {
					if (panels.hasOwnProperty[key]) {
						panels[key].selected = false;
					}
				}

				// Select the current panel
				panel.selected = true;

				// Append the title
				that.$navBar.html('');
				for (var key in panel.navbar) {
					if (panel.navbar.hasOwnProperty(key)) {
						var value = panel.navbar[key];

						if (value) {
							var linkFn = $compile(panel.navbar[key]),
								html = linkFn($scope);

							that.$navBar.append(html);
						}
					}
				}
			};

			window.navPanels = $scope;

			this.addPanel = function(panel) {
				if (Object.keys(panels).length === 0) {
					this.select(panel);
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
		template: '<nav class="navbar"></nav>',
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
		template: '<section class="panel" ng-class="{\'selected\': selected}" ng-transclude></section>',
		scope: {},
		controller: function($scope, $element) {
			// Necessary for the directive dependency
			this.navbar = $scope.navbar = {
				back: null,
				title: null,
				actions: null
			};

			//$element.find('nav-bar').remove();
		},
		link: function(scope, elem, attrs, panelsCtrl) {
			scope.key = attrs.state;
			panelsCtrl.addPanel(scope);
		}
	};
})
.directive('panelContent', function() {
	return {
		require: '^panel',
		restrict: 'E',
		replace: true,
		transclude: true,
		template: '<div class="panel-content" ng-transclude></div>',
		link: function(scope, elem, attrs) {

		}
	};
})
.directive('navBackButton', function() {
	return {
		require: '^panel',
		restrict: 'E',
		replace: true,
		transclude: true,
		template: '<div ng-transclude></div>',
		link: function(scope, elem, attrs, panelCtrl) {
			panelCtrl.navbar.back = '<div class="back-button">' + elem.html() + '</div>';
		}
	};
})
.directive('navTitle', function() {
	return {
		require: '^panel',
		restrict: 'E',
		replace: true,
		transclude: true,
		template: '<div ng-transclude></div>',
		link: function(scope, elem, attrs, panelCtrl) {
			panelCtrl.navbar.title = '<h1 class="title">' + elem.html() + '</h1>';
		}
	};
})
.directive('navAction', function() {
	return {
		require: '^panel',
		restrict: 'E',
		replace: true,
		transclude: true,
		template: '<div ng-transclude></div>',
		link: function(scope, elem, attrs, panelCtrl) {
			panelCtrl.navbar.action = '<div class="actions">' + elem.html() + '</div>';
		}
	};
})