var RetentionSettingControllerUI = {

	get template()
	{
		return document.getElementById('template');
	},
	get tabContainer()
	{
		return document.getElementById('tabs');
	},
	get panelContainer()
	{
		return document.getElementById('tabpanels');
	},

	get selectedTab()
	{
		return this.tabContainer.selectedItem;
	},
	set selectedTab(aValue)
	{
		this.tabContainer.selectedItem = aValue;
		return aValue;
	},

	createNewContents : function()
	{
		var range = document.createRange();
		range.selectNodeContents(this.template);
		var newContents = range.cloneContents(true);
		range.detach();

		return newContents;
	},

	addTab : function()
	{
		var id = this.tabContainer.childNodes.length+1;

		var tab = document.createElement('tab');
		tab.setAttribute('label', id);
		this.tabContainer.appendChild(tab);

		var panel = this.createNewContents();
		this.panelContainer.appendChild(panel);

		var prefItems = this.panelContainer.lastChild.getElementsByAttribute('prefid', '*');
		Array.slice(prefItems).forEach(function(aNode) {
			aNode.setAttribute('id', aNode.getAttribute('prefid')+'-'+id);
		});

		var labels = this.panelContainer.lastChild.getElementsByAttribute('control-prefid', '*');
		Array.slice(labels).forEach(function(aNode) {
			aNode.setAttribute('control', aNode.getAttribute('control-prefid')+'-'+id);
		});

		this.tabContainer.selectedItem = tab;

		return tab;
	},

	removeTab : function(aTab)
	{
		var panel = this.getPanelFromTab(aTab);
		this.tabContainer.removeChild(aNode);
		this.panelContainer.removeChild(panel);
	},

	getPanelFromTab : function(aTab)
	{
		var panel;
		Array.slice(this.tabContainer.childNodes).some(function(aNode, aIndex) {
			if (aNode != aTab) return false;
			panel = this.panelContainer.childNodes[aIndex];
			return true;
		}, this);
		return panel;
	},

	getItemForSetting : function(aPanel, aName)
	{
		return aPanel.getElementsByAttribute('prefid', aName)[0];
	},

	setSettingsToTab : function(aTab, aSettings)
	{
		var panel = this.getPanelFromTab(aTab);
		this.getItemForSetting(panel, 'pattern').value = aSettings.pattern;
		this.getItemForSetting(panel, 'retainByPreference').value = aSettings.retainByPreference;
		this.getItemForSetting(panel, 'numHeadersToKeep').value = aSettings.numHeadersToKeep;
		this.getItemForSetting(panel, 'daysToKeepHdrs').value = aSettings.daysToKeepHdrs;
		this.getItemForSetting(panel, 'keepUnreadMessagesOnly').checked = aSettings.keepUnreadMessagesOnly;
	},

	getSettingsFromTab : function(aTab)
	{
		var panel = this.getPanelFromTab(aTab);
		return {
			pattern : this.getItemForSetting(panel, 'pattern').value,
			retainByPreference : parseInt(this.getItemForSetting(panel, 'retainByPreference').value),
			numHeadersToKeep : parseInt(this.getItemForSetting(panel, 'numHeadersToKeep').value),
			daysToKeepHdrs : parseInt(this.getItemForSetting(panel, 'daysToKeepHdrs').value),
			keepUnreadMessagesOnly : this.getItemForSetting(panel, 'keepUnreadMessagesOnly').checked
		};
	},

	initFromSettings : function(aSettingsArray)
	{
		try {
			aSettingsArray = eval(aSettingsArray);
		}
		catch(e) {
			aSettingsArray = [];
		}
		if (!aSettingsArray.length) {
			this.addTab();
		}
		else {
			var tabs = aSettingsArray.map(function(aSettings) {
					var tab = this.addTab();
					this.setSettingToTab(tab, aSettigns);
					return tab;
				}, this);
			this.selectedTab = tabs[0];
		}
	},

	getSettings : function()
	{
		var settingsArray = Array.splice(this.tabContainer.childNodes)
				.map(function(aTab) {
					return this.getSettingsFromTab(aTab);
				}, this);
		return settingsArray.toSource();
	}
};
