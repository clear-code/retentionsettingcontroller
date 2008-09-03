var gSettingsHolder;

function init()
{
	gSettingsHolder = document.getElementById('extensions.retentionsettingcontroller.settings-textbox');
	RetentionSettingControllerUI.initFromSettings(gSettingsHolder.value);
}

function onChange()
{
	gSettingsHolder.value = RetentionSettingControllerUI.getSettings();
	var event = document.createEvent('UIEvents');
	event.initUIEvent('input', true, false, window, 0);
	gSettingsHolder.dispatchEvent(event);
}
