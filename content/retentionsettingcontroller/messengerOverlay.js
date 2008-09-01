window.addEventListener('DOMContentLoaded', function() {
	window.removeEventListener('DOMContentLoaded', arguments.callee, false);

	const ObserverService = Components 
			.classes['@mozilla.org/observer-service;1']
			.getService(Components.interfaces.nsIObserverService);

	ObserverService.notifyObservers(window, 'retentionsettingcontroller:messengerStartup', null);


	eval('window.NewFolder = '+window.NewFolder.toSource().replace(
		/DoRDFCommand\([^;]+\);/,
		'$& retentionsettingcontrollerNotifyChange(uri, name);'
	));

	eval('window.RenameFolder = '+window.RenameFolder.toSource().replace(
		/RenameFolder\([^;]+\);/,
		'$& retentionsettingcontrollerNotifyChange(uri.replace(/\\/[^\\/]+$/, ""), name);'
	));

	eval('window.DropOnFolderTree = '+window.DropOnFolderTree.toSource().replace(
		/CopyFolders\([^;]+\);/,
		'$& retentionsettingcontrollerNotifyChange(targetUri, sourceFolder.prettiestName);'
	));

}, false);

function retentionsettingcontrollerNotifyChange(aURI, aNewName)
{
	const RDF = Components
			.classes['@mozilla.org/rdf/rdf-service;1']
			.getService(Components.interfaces.nsIRDFService);
	var folder = RDF.GetResource(aURI)
			.QueryInterface(Components.interfaces.nsIMsgFolder);

	const ObserverService = Components 
			.classes['@mozilla.org/observer-service;1']
			.getService(Components.interfaces.nsIObserverService);

	ObserverService.notifyObservers(folder, 'retentionsettingcontroller:folderChanged', aNewName);
}
