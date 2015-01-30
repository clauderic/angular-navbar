# Angular Nav Panels
A nav-bar directive for AngularJS for mobile devices with sliding view transitions

### IMPORTANT NOTE: 
This is a work in progress. Partial fork of ion-nav-view, removed dependency on ui-router, which allows for nesting within modals and other directives.

#### Get started
**(1)** Get Angular Nav Panels:
 - [download the release](https://raw.githubusercontent.com/clauderic/angular-navbar/master/index.js)
 - clone this repository

**(2)** Include `angular-nav-panels.js` (or `angular-nav-panels.min.js`) in your `index.html`, after including Angular itself (For Component users: ignore this step)

**(3)** Add `'ngNavPanels'` to your main module's list of dependencies (For Component users: replace `'ngNavPanels'` with `require('ng-nav-panels')`)

Your markup should look like the following:
```html
<nav-panels delegateHandle="mainNav">
	<panel state="overview">
		<nav-bar>
			<nav-title><strong ng-click="doSomething()">Main</strong></nav-title>
		</nav-bar>
		<panel-content>
			<p>Some content for the main panel.</p>
			<button ng-click="goTo('edit');">Go to edit panel</button
		</panel-content>
	</panel>
	<panel state="edit">
		<nav-bar>
			<nav-back-button></nav-back-button>
			<nav-title>Edit</nav-title>
			<nav-buttons><button ng-click="done()">Done</button></nav-buttons>
		</nav-bar>
		<panel-content>
			Secondary panel
		</panel-content>
	</panel>
	[...]
</nav-panels>
```
#### Methods
You can use the `goTo(state)` and `goBack()` methods to navigate between panels
