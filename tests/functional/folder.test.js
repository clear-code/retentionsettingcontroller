utils.include('../unit/SettingsStab.js');

var messenger;
var rootFolder;

function setUp()
{
	rootFolder = utils.mail.localFolder.addSubfolder('ルート'+parseInt(Math.random() * 65000));
	rootFolder.QueryInterface(Ci.nsIRDFResource);
	var child1 = rootFolder.addSubfolder('子1');
	child1.addSubfolder('孫1');
	child1.addSubfolder('孫2');
	var child2 = rootFolder.addSubfolder('子2');
	child2.addSubfolder('孫3');
	child2.addSubfolder('孫4');

	yield utils.setUpTestWindow();
	messenger = utils.getTestWindow();
}

function tearDown()
{
	utils.mail.deleteFolder(rootFolder);
	utils.tearDownTestWindow();
}

function testRetentionSettings()
{
	var folder = rootFolder;
	var settings = rootFolder.retentionSettings;
	assert.isTrue(settings.useServerDefaults);

	utils.setPref('extensions.retentionsettingcontroller.settings', '');

	folder = utils.mail.getFolderByURI(rootFolder.Value+'/'+encodeURIComponent('子1'));
	assert.isNotNull(folder);
	assert.isTrue(folder.retentionSettings.useServerDefaults);

	folder = utils.mail.getFolderByURI(rootFolder.Value+'/'+encodeURIComponent('子1')+'/'+encodeURIComponent('孫1'));
	assert.isNotNull(folder);
	assert.isTrue(folder.retentionSettings.useServerDefaults);

	folder = utils.mail.getFolderByURI(rootFolder.Value+'/'+encodeURIComponent('子1')+'/'+encodeURIComponent('孫2'));
	assert.isNotNull(folder);
	assert.isTrue(folder.retentionSettings.useServerDefaults);

	folder = utils.mail.getFolderByURI(rootFolder.Value+'/'+encodeURIComponent('子2'));
	assert.isNotNull(folder);
	assert.isTrue(folder.retentionSettings.useServerDefaults);

	folder = utils.mail.getFolderByURI(rootFolder.Value+'/'+encodeURIComponent('子2')+'/'+encodeURIComponent('孫3'));
	assert.isNotNull(folder);
	assert.isTrue(folder.retentionSettings.useServerDefaults);

	folder = utils.mail.getFolderByURI(rootFolder.Value+'/'+encodeURIComponent('子2')+'/'+encodeURIComponent('孫4'));
	assert.isNotNull(folder);
	assert.isTrue(folder.retentionSettings.useServerDefaults);


	var settings = createSettingsStab();
	utils.setPref('extensions.retentionsettingcontroller.settings', settings.toSource());

	folder = utils.mail.getFolderByURI(rootFolder.Value+'/'+encodeURIComponent('子1'));
	assert.isNotNull(folder);
	settings = folder.retentionSettings;
	assert.isFalse(settings.useServerDefaults);
	assert.equals(3, settings.daysToKeepHdrs);
	assert.equals(1, settings.numHeadersToKeep);

	folder = utils.mail.getFolderByURI(rootFolder.Value+'/'+encodeURIComponent('子1')+'/'+encodeURIComponent('孫1'));
	assert.isNotNull(folder);
	settings = folder.retentionSettings;
	assert.isFalse(settings.useServerDefaults);
	assert.equals(3, settings.daysToKeepHdrs);
	assert.equals(1, settings.numHeadersToKeep);

	folder = utils.mail.getFolderByURI(rootFolder.Value+'/'+encodeURIComponent('子1')+'/'+encodeURIComponent('孫2'));
	assert.isNotNull(folder);
	settings = folder.retentionSettings;
	assert.isFalse(settings.useServerDefaults);
	assert.equals(3, settings.daysToKeepHdrs);
	assert.equals(1, settings.numHeadersToKeep);

	folder = utils.mail.getFolderByURI(rootFolder.Value+'/'+encodeURIComponent('子2'));
	assert.isNotNull(folder);
	settings = folder.retentionSettings;
	assert.isTrue(settings.useServerDefaults);

	folder = utils.mail.getFolderByURI(rootFolder.Value+'/'+encodeURIComponent('子2')+'/'+encodeURIComponent('孫3'));
	assert.isNotNull(folder);
	settings = folder.retentionSettings;
	assert.isFalse(settings.useServerDefaults);
	assert.equals(60, settings.daysToKeepHdrs);
	assert.equals(200, settings.numHeadersToKeep);

	folder = utils.mail.getFolderByURI(rootFolder.Value+'/'+encodeURIComponent('子2')+'/'+encodeURIComponent('孫4'));
	assert.isNotNull(folder);
	settings = folder.retentionSettings;
	assert.isFalse(settings.useServerDefaults);
	assert.equals(60, settings.daysToKeepHdrs);
	assert.equals(200, settings.numHeadersToKeep);
}
