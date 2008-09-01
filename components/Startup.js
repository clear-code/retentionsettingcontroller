const kCID  = Components.ID('{fa181330-77e9-11dd-ad8b-0800200c9a66}'); 
const kID   = '@clear-code.com/retentionsettingcontroller/startup;1';
const kNAME = "Retention Setting Controller Service";

const DEBUG = true;

function mydump()
{
	if (DEBUG)
		dump(Arrays.slice(arguments).join('\n').replace(/\n$/, '')+'\n');
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
				return;

			case 'retentionsettingcontroller:messengerStartup':
				if (this.onStartup) {
					this.onStartup = false;
					this.scanAllFolders(aSubject);
				}
				return;

			case 'quit-application':
				ObserverService.removeObserver(this, 'retentionsettingcontroller:messengerStartup');
				ObserverService.removeObserver(this, 'quit-application');
				return;
		}
	},
	onStartup : true,

	scanAllFolders : function(aWindow)
	{
		var accountManager = Components
				.classes['@mozilla.org/messenger/account-manager;1']
				.getService(Components.interfaces.nsIMsgAccountManager);
		var servers = accountManager.allServers;

		var server;
		for (var i = 0, maxi = servers.Count(); i < maxi; i++)
		{
			try {
				server = servers.GetElementAt(i)
					.QueryInterface(Components.interfaces.nsIMsgIncomingServer);
				this.scanFolder(server.rootFolder, false);
			}
			catch(e) {
				dump(e+'\n');
			}
		}
	},

	scanFolder : function(aFolder, aInheritParent)
	{
		if (aFolder.folderURL in this.done) return;
mydump(aFolder.prettiestName);
		this.done[aFolder.folderURL] = true;

		if (this.targetNamePattern.test(aFolder.prettiestName)) {
			aInheritParent = true;
mydump('  set custom setting to '+aFolder.prettiestName);
		}
		else if (aInheritParent && this.inheritFromParent) {
mydump('  set parent setting to '+aFolder.prettiestName);
		}
		else if (this.disableForNotMatchedFolders && aFolder.retentionSettings) {
mydump('  disable custom setting of '+aFolder.prettiestName);
			aFolder.retentionSettings.useServerDefaults = true;
		}

		var children = aFolder.getAllFoldersWithFlag(0);
		var folder;
		for (var i = 0, maxi = children.Count(); i < maxi; i++)
		{
			try {
				folder = children.GetElementAt(i)
					.QueryInterface(Components.interfaces.nsIMsgFolder);
				arguments.callee.call(this, folder, aInheritParent);
			}
			catch(e) {
				dump(e+'\n');
			}
		}
	},
	done : {},

	isDifferentSetting : function(aBase, aTarget)
	{
		if (!aTarget) return false;
		var props = [
				'useServerDefaults',
				'retainByPreference',
				'daysToKeepHdrs',
				'numHeadersToKeep',
				'keepUnreadMessagesOnly',
				'cleanupBodiesByDays',
				'daysToKeepBodies'
			];
		return props.some(function(aProp) {
				return aBase[aProp] != aTarget[aProp];
			});
	},

	get targetNamePattern()
	{
		if (this._targetNamePattern === null) {
			var regexp = Prefs.getCharPref('extensions.retentionsettingcontroller.targetPatterns.name');
			regexp = decodeURIComponent(escape(regexp));
			if (!regexp) regexp = '[^\\w\\W]';
			this._targetNamePattern = new RegExp(regexp, 'i');
		}
		return this._targetNamePattern;
	},
	_targetNamePattern : null,

	get inheritFromParent()
	{
		if (this._inheritFromParent === null)
			this._inheritFromParent = Prefs.getBoolPref('extensions.retentionsettingcontroller.inheritFromParent');
		return this._inheritFromParent;
	},
	_inheritFromParent : null,

	get disableForNotMatchedFolders()
	{
		if (this._disableForNotMatchedFolders === null)
			this._disableForNotMatchedFolders = Prefs.getBoolPref('extensions.retentionsettingcontroller.disableForNotMatchedFolders');
		return this._disableForNotMatchedFolders;
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
 
