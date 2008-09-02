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
		Array.slice(this.tabContainer.childNodes).some(function(aNode, aIndex) {
			if (aNode != aTab) return false;
			this.tabContainer.removeChild(aNode);
			this.panelContainer.removeChild(this.panelContainer.childNodes[aIndex]);
			return true;
		}, this);
	}

};
