function scanAllAccounts()
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
			scanFolder(server.rootFolder);
		}
		catch(e) {
			dump(e+'\n');
		}
	}
}

var done = {};

function scanFolder(aFolder)
{
	if (aFolder.folderURL in done) return;
//	dump(aFolder.prettiestName+'\n');
//	dump('  '+aFolder.folderURL+'\n');
	done[aFolder.folderURL] = true;

	var children = aFolder.getAllFoldersWithFlag(0);
	var folder;
	for (var i = 0, maxi = children.Count(); i < maxi; i++)
	{
		try {
			folder = children.GetElementAt(i)
				.QueryInterface(Components.interfaces.nsIMsgFolder);
			arguments.callee(folder);
		}
		catch(e) {
			dump(e+'\n');
		}
	}
}
