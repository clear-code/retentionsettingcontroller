window.addEventListener('DOMContentLoaded', function() {
	window.removeEventListener('DOMContentLoaded', arguments.callee, false);

	if ('registerExtraPanelForPref' in window)
		registerExtraPanelForPref(
			[
				'extensions.retentionsettingcontroller.settings',
				'extensions.retentionsettingcontroller.inheritFromParent',
				'extensions.retentionsettingcontroller.disableForNotMatchedFolders'
			],
			'retentionsettingcontroller',
			gRetentionSettingControllerPanelLabel,
			'chrome://retentionsettingcontroller/content/configPanel.xul'
		);
}, false);
