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

const kCID  = Components.ID('{fa181330-77e9-11dd-ad8b-0800200c9a66}'); 
const kID   = '@clear-code.com/retentionsettingcontroller/startup;1';
const kNAME = "Retention Setting Controller Service";

const DEBUG = false;

function mydump()
{
	if (DEBUG)
		dump(Array.slice(arguments).join('\n').replace(/\n$/, '')+'\n');
}

const ObserverService = Components
		.classes['@mozilla.org/observer-service;1']
		.getService(Components.interfaces.nsIObserverService);

var Prefs = Components
		.classes['@mozilla.org/preferences;1']
		.getService(Components.interfaces.nsIPrefBranch);
 
function StartupService() { 
}
StartupService.prototype = {
	 
	observe : function(aSubject, aTopic, aData) 
	{
		switch (aTopic)
		{
			case 'app-startup':
				ObserverService.addObserver(this, 'quit-application', false);
				ObserverService.addObserver(this, 'retentionsettingcontroller:messengerStartup', false);
				ObserverService.addObserver(this, 'retentionsettingcontroller:folderChanged', false);
				return;

			case 'retentionsettingcontroller:messengerStartup':
				if (this.onStartup) {
					this.onStartup = false;
					this.updateAllFolders();
				}
				return;

			case 'retentionsettingcontroller:folderChanged':
				aSubject = aSubject.QueryInterface(Components.interfaces.nsIMsgFolder);
				this.updateFolderByName(aSubject, aData);
				return;

			case 'quit-application':
				ObserverService.removeObserver(this, 'retentionsettingcontroller:messengerStartup');
				ObserverService.removeObserver(this, 'retentionsettingcontroller:folderChanged');
				ObserverService.removeObserver(this, 'quit-application');
				return;
		}
	},
	onStartup : true,

	get servers()
	{
		var accountManager = Components
				.classes['@mozilla.org/messenger/account-manager;1']
				.getService(Components.interfaces.nsIMsgAccountManager);
		var servers = accountManager.allServers;

		var retVal = [];
		var server;
		for (var i = 0, maxi = servers.Count(); i < maxi; i++)
		{
			try {
				server = servers.GetElementAt(i)
					.QueryInterface(Components.interfaces.nsIMsgIncomingServer);
				retVal.push(server);
			}
			catch(e) {
				dump(e+'\n');
			}
		}
		return retVal;
	},

	updateAllFolders : function()
	{
		this.servers.forEach(function(aServer) {
			this.updateFolder(aServer.rootFolder, false);
		}, this);
	},

	updateFolder : function(aFolder, aInheritParent)
	{
		mydump(aFolder.prettiestName);
		var inheritedSetting;
		if (aInheritParent && this.inheritFromParent) {
			var parent = aFolder.parentMsgFolder;
			while (parent)
			{
				inheritedSetting = this.getMatchedSettings(parent)
				if (inheritedSetting) break;
				parent = parent.parentMsgFolder;
			}
		}
		var setting;
		if ((setting = this.getMatchedSettings(aFolder)) || inheritedSetting) {
			if (!setting) setting = inheritedSetting;
			this.normalizeSettings(setting);
			try {
				aFolder.retentionSettings = setting;
			}
			catch(e) {
				mydump(e+'\n'+uneval(setting)+'\n');
			}
			aInheritParent = true;
			mydump('  set custom setting to '+aFolder.prettiestName);
		}
		else if (this.disableForNotMatchedFolders && aFolder.retentionSettings) {
			mydump('  disable custom setting of '+aFolder.prettiestName);
			aFolder.retentionSettings.useServerDefaults = true;
		}

		var children = this.getChildFolders(aFolder);
		children.forEach(function(aChildFolder) {
			this.updateFolder(aChildFolder, aInheritParent);
		}, this);
	},
	getMatchedSettings : function(aFolder)
	{
		var name = aFolder.prettiestName;
		var setting = null;
		this.customSettings.some(function(aSetting) {
			if (aSetting.pattern.test(name)) {
				setting = aSetting;
				return true;
			}
			return false;
		});
		return setting;
	},
	getChildFolders : function(aFolder)
	{
		var retVal = [];

		var children = aFolder.GetSubFolders();
		try {
			children.first();
		}
		catch(e) {
			return retVal; // there is no item.
		}

		var folder;
		while (true)
		{
			try {
				folder = children.currentItem()
					.QueryInterface(Components.interfaces.nsIMsgFolder);
				retVal.push(folder);
			}
			catch(e) {
				dump(e+'\n');
			}
			try {
				children.next();
			}
			catch(e) {
				break; // no more item.
			}
		}
		return retVal;
	},

	normalizeSettings : function(aSettings)
	{
		aSettings.useServerDefaults = false;

		if (!('retainByPreference' in aSettings))
			aSettings.retainByPreference = 1;
		aSettings.retainByPreference = parseInt(aSettings.retainByPreference);

		if (!('daysToKeepHdrs' in aSettings))
			aSettings.daysToKeepHdrs = 30;
		aSettings.daysToKeepHdrs = parseInt(aSettings.daysToKeepHdrs);

		if (!('numHeadersToKeep' in aSettings))
			aSettings.numHeadersToKeep = 30;
		aSettings.numHeadersToKeep = parseInt(aSettings.numHeadersToKeep);

		if (!('daysToKeepBodies' in aSettings))
			aSettings.daysToKeepBodies = 30;
		aSettings.daysToKeepBodies = parseInt(aSettings.daysToKeepBodies);

		if (!('cleanupBodiesByDays' in aSettings))
			aSettings.cleanupBodiesByDays = false;
		aSettings.cleanupBodiesByDays = !(!aSettings.cleanupBodiesByDays);

		if (!('keepUnreadMessagesOnly' in aSettings))
			aSettings.keepUnreadMessagesOnly = false;
		aSettings.keepUnreadMessagesOnly = !(!aSettings.keepUnreadMessagesOnly);
	},

	updateFolderByName : function(aFolder, aName)
	{
		if (!aName) {
			this.updateFolder(aFolder, true);
			return;
		}
		var children = this.getChildFolders(aFolder);
		children.some(function(aChildFolder) {
			if (aChildFolder.prettiestName == aName) {
				this.updateFolder(aChildFolder, true);
				return true;
			}
			return false;
		}, this);
	},

	get customSettings()
	{
		if (this._customSettings === null) {
			var settings = Prefs.getCharPref('extensions.retentionsettingcontroller.settings');
			this._customSettings = this.parseCustomSettings(decodeURIComponent(escape(settings)));
		}
		return this._customSettings;
	},
	set customSettings(aValue)
	{
		this._customSettings = aValue;
		return aValue;
	},
	_customSettings : null,
	parseCustomSettings : function(aJSON)
	{
		var settings;
		try {
			settings = eval(aJSON) || [];
		}
		catch(e) {
			settings = [];
		}
		settings.forEach(function(aSetting) {
			var regexp = aSetting.pattern;
			if (!regexp) regexp = '[^\\w\\W]';
			var match = regexp.match(this.regExpPattern);
			aSetting.pattern = new RegExp(
				(match ? match[1] : regexp ),
				(match ? match[2] : 'i' )
			);
		}, this);
		return settings;
	},
	regExpPattern : /^\/((?:\\.|\[(?:\\.|[^\]])*\]|[^\/])+)\/([gimy]*)$/,

	get inheritFromParent()
	{
		if (this._inheritFromParent === null)
			this._inheritFromParent = Prefs.getBoolPref('extensions.retentionsettingcontroller.inheritFromParent');
		return this._inheritFromParent;
	},
	set inheritFromParent(aValue)
	{
		this._inheritFromParent = aValue;
		return aValue;
	},
	_inheritFromParent : null,

	get disableForNotMatchedFolders()
	{
		if (this._disableForNotMatchedFolders === null)
			this._disableForNotMatchedFolders = Prefs.getBoolPref('extensions.retentionsettingcontroller.disableForNotMatchedFolders');
		return this._disableForNotMatchedFolders;
	},
	set disableForNotMatchedFolders(aValue)
	{
		this._disableForNotMatchedFolders = aValue;
		return aValue;
	},
	_disableForNotMatchedFolders : null,


	QueryInterface : function(aIID) 
	{
		if(!aIID.equals(Components.interfaces.nsIObserver) &&
			!aIID.equals(Components.interfaces.nsISupports)) {
			throw Components.results.NS_ERROR_NO_INTERFACE;
		}
		return this;
	}
 
}; 
 	 
var gModule = { 
	registerSelf : function(aCompMgr, aFileSpec, aLocation, aType)
	{
		aCompMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		aCompMgr.registerFactoryLocation(
			kCID,
			kNAME,
			kID,
			aFileSpec,
			aLocation,
			aType
		);

		var catMgr = Components.classes['@mozilla.org/categorymanager;1']
					.getService(Components.interfaces.nsICategoryManager);
		catMgr.addCategoryEntry('app-startup', kNAME, kID, true, true);
	},

	getClassObject : function(aCompMgr, aCID, aIID)
	{
		return this.factory;
	},

	factory : {
		QueryInterface : function(aIID)
		{
			if (!aIID.equals(Components.interfaces.nsISupports) &&
				!aIID.equals(Components.interfaces.nsIFactory)) {
				throw Components.results.NS_ERROR_NO_INTERFACE;
			}
			return this;
		},
		createInstance : function(aOuter, aIID)
		{
			return new StartupService();
		}
	},

	canUnload : function(aCompMgr)
	{
		return true;
	}
};

function NSGetModule(aCompMgr, aFileSpec) {
	return gModule;
}
 
