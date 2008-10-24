utils.include('../unit/SettingsStab.js');

var messenger;
var rootFolder;

function setUp()
{
	rootFolder = utils.mail.localFolder.addSubfolder('ルート'+parseInt(Math.random() * 65000));
	var child1 = rootFolder.addSubfolder('子1');
	child1.addSubfolder('孫1');
	child1.addSubfolder('孫2');
	var child2 = rootFolder.addSubfolder('子2');
	child2.addSubfolder('孫3');
	child2.addSubfolder('孫4');

	var settings = createSettingsStab();
	utils.setPref('extensions.retentionsettingcontroller.settings', settings.toSource());

	yield utils.setUpTestWindow();
	messenger = utils.getTestWindow();
}

function tearDown()
{
	utils.mail.deleteFolder(rootFolder);
	utils.tearDownTestWindow();
}

function testFoo()
{
}
