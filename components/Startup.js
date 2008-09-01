const kCID  = Components.ID('{fa181330-77e9-11dd-ad8b-0800200c9a66}'); 
const kID   = '@clear-code.com/retentionsettingcontroller/startup;1';
const kNAME = "Retention Setting Controller Service";

const DEBUG = true;

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
if (setting) mydump('  inherit parent setting to '+aFolder.prettiestName);
		}
		var setting;
		if ((setting = this.getMatchedSettings(aFolder)) || inheritedSetting) {
			if (!setting) setting = inheritedSetting;
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
			settings = eval(aJSON);
		}
		catch(e) {
			settings = [];
		}
		settings.forEach(function(aSetting) {
			var regexp = aSetting.pattern;
			if (!regexp) regexp = '[^\\w\\W]';
			aSetting.pattern = new RegExp(regexp, 'i');
		});
		return settings;
	},

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
 
