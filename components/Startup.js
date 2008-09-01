const kCID  = Components.ID('{fa181330-77e9-11dd-ad8b-0800200c9a66}'); 
const kID   = '@clear-code.com/retentionsettingcontroller/startup;1';
const kNAME = "Retention Setting Controller Service";

const ObserverService = Components
		.classes['@mozilla.org/observer-service;1']
		.getService(Components.interfaces.nsIObserverService);
 
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
				this.scanFolder(server.rootFolder);
			}
			catch(e) {
				dump(e+'\n');
			}
		}
	},

	scanFolder : function(aFolder)
	{
		if (aFolder.folderURL in this.done) return;
dump(aFolder.prettiestName+'\n');
dump('  '+aFolder.folderURL+'\n');
		this.done[aFolder.folderURL] = true;

		var children = aFolder.getAllFoldersWithFlag(0);
		var folder;
		for (var i = 0, maxi = children.Count(); i < maxi; i++)
		{
			try {
				folder = children.GetElementAt(i)
					.QueryInterface(Components.interfaces.nsIMsgFolder);
				arguments.callee.call(this, folder);
			}
			catch(e) {
				dump(e+'\n');
			}
		}
	},
	done : {},
  
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
 
