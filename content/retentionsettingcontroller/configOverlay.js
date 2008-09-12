/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is "Retention Setting Controller".
 *
 * The Initial Developer of the Original Code is ClearCode Inc.
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): ClearCode Inc. <info@clear-code.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

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
	get bundle()
	{
		return document.getElementById('retentionsettingcontroller-bundle');
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
		tab.setAttribute('label', this.bundle.getString('default_name'));
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
		this.tabContainer.removeChild(aTab);
		this.panelContainer.removeChild(panel);
	},

	removeCurrentTab : function(aTab)
	{
		if (this.tabContainer.childNodes.length > 1) {
			this.removeTab(this.selectedTab);
		}
		else {
			this.setSettingsToTab(this.selectedTab, {
				pattern                : '',
				retainByPreference     : 1,
				numHeadersToKeep       : 30,
				daysToKeepHdrs         : 30,
				keepUnreadMessagesOnly : false,
				name                   : this.bundle.getString('default_name')
			});
		}
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
		if (aSettings.name)
			aTab.setAttribute('label', aSettings.name);
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
			name : aTab.getAttribute('label'),
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
			aSettingsArray = eval(aSettingsArray) || [];
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
					this.setSettingsToTab(tab, aSettings);
					return tab;
				}, this);
			this.selectedTab = tabs[0];
		}
	},

	getSettings : function()
	{
		var settingsArray = Array.slice(this.tabContainer.childNodes)
				.map(function(aTab) {
					return this.getSettingsFromTab(aTab);
				}, this);
		return settingsArray.toSource();
	},


	readyToChangeTabName : function(aTab)
	{
		if (this._inputField) {
			this.applyNewName();
		}
		if (aTab.localName != 'tab') return;
		this._inputField = document.createElement('textbox');
		this._inputField.setAttribute('onkeypress', 'RetentionSettingControllerUI.onKeyPress(event);');
		this._inputField.setAttribute('onclick', 'event.stopPropagation();');
		this._inputField.setAttribute('ondblclick', 'event.stopPropagation();');
		this._inputField.setAttribute('input', 'event.stopPropagation();');
		this._inputField.setAttribute('style', 'margin:0;padding:0;line-height:1;');
		this._inputField.setAttribute('value', aTab.getAttribute('label'));
		aTab.setAttribute('label', '');
		aTab.appendChild(this._inputField);
		this._inputField.select();
		this._inputField.focus();
	},
	_inputField : null,
	applyNewName : function()
	{
		if (!this._inputField) return;
		var name = this._inputField.value;
		var tab = this._inputField.parentNode;
		tab.removeChild(this._inputField);
		tab.setAttribute('label', name.replace(/^\s+|\s+$/g, ''));
		this._inputField = null;
		var event = document.createEvent('HTMLEvents');
		event.initEvent ('change', true, true);
		tab.dispatchEvent (event);
	},

	onKeyPress : function(aEvent)
	{
		switch (aEvent.keyCode)
		{
			case aEvent.DOM_VK_ENTER:
			case aEvent.DOM_VK_RETURN:
				this.applyNewName();
				return;
		}
	}
};
