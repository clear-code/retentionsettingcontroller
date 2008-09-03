window.addEventListener('DOMContentLoaded', function() {
	window.removeEventListener('DOMContentLoaded', arguments.callee, false);

	if ('registerExtraPanelForPref' in window)
		registerExtraPanelForPref(
			[
				'extensions.retentionsettingcontroller.settings'
			],
			'retentionsettingcontroller',
			'retention settings',
			'chrome://retentionsettingcontroller/content/configPanel.xul'
		);
}, false);
