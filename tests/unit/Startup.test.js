utils.include('../../components/Startup.js');
utils.include('FolderStab.js');

function createSettingsStab()
{
	return [
		{
			pattern                : '子1',
			useServerDefaults      : false,
			retainByPreference     : 0,
			daysToKeepHdrs         : 3,
			numHeadersToKeep       : 1,
			keepUnreadMessagesOnly : false,
			cleanupBodiesByDays    : false,
			daysToKeepBodies       : 3
		},
		{
			pattern                : '孫[34]',
			useServerDefaults      : false,
			retainByPreference     : 0,
			daysToKeepHdrs         : 60,
			numHeadersToKeep       : 200,
			keepUnreadMessagesOnly : true,
			cleanupBodiesByDays    : true,
			daysToKeepBodies       : 60
		},
		{
			pattern                : '',
			useServerDefaults      : true,
			retainByPreference     : 0,
			daysToKeepHdrs         : 60,
			numHeadersToKeep       : 200,
			keepUnreadMessagesOnly : true,
			cleanupBodiesByDays    : true,
			daysToKeepBodies       : 60
		}
	];
}

function createFolderStab()
{
	var folder = new FolderStab('ルート');

	var child = folder._appendChild(new FolderStab('子1'));
	child._appendChild(new FolderStab('孫1'));
	child._appendChild(new FolderStab('孫2'));

	child = folder._appendChild(new FolderStab('子2'));
	child._appendChild(new FolderStab('孫3'));
	child._appendChild(new FolderStab('孫4'));

	return folder;
}

var service;

function setUp()
{
	service = new StartupService();
	service.customSettings = [];
	service.inheritFromParent = true;
	service.disableForNotMatchedFolders = true;
}

function tearDown()
{
}

function testParseCustomSettings()
{
	var settings = createSettingsStab();
	settings = settings.toSource();
	var parsed = service.parseCustomSettings(settings);
	assert.equals(3, parsed.length);
	assert.pattern('子1', parsed[0].pattern);
	assert.notPattern('子2', parsed[0].pattern);
	assert.pattern('孫3', parsed[1].pattern);
	assert.notPattern('孫2', parsed[1].pattern);
	assert.notPattern('ルート', parsed[2].pattern);
}

function testGetMatchedSettings()
{
	service.customSettings = service.parseCustomSettings(createSettingsStab().toSource());
	var folder = createFolderStab();

	var setting = service.getMatchedSettings(folder);
	assert.isNull(setting);

	setting = service.getMatchedSettings(folder._children[0]);
	assert.isNotNull(setting);
	assert.equals(3, setting.daysToKeepHdrs);
}

function testFolderTraversal()
{
	var folder = createFolderStab();
	var children = service.getChildFolders(folder);
	assert.equals(2, children.length);
	assert.equals('子1', children[0].prettiestName);
}

function testUpdateFolder()
{
	service.customSettings = service.parseCustomSettings(createSettingsStab().toSource());

	var folder = createFolderStab();
	service.updateFolder(folder);

	var settings = folder.retentionSettings;
	assert.isNull(settings);

	settings = folder._children[0].retentionSettings;
	assert.isFalse(settings.useServerDefaults);
	assert.equals(3, settings.daysToKeepHdrs);
	assert.equals(1, settings.numHeadersToKeep);

	settings = folder._children[0]._children[0].retentionSettings;
	assert.isFalse(settings.useServerDefaults);
	assert.equals(3, settings.daysToKeepHdrs);
	assert.equals(1, settings.numHeadersToKeep);

	settings = folder._children[0]._children[1].retentionSettings;
	assert.isFalse(settings.useServerDefaults);
	assert.equals(3, settings.daysToKeepHdrs);
	assert.equals(1, settings.numHeadersToKeep);

	settings = folder._children[1].retentionSettings;
	assert.isNull(settings);

	settings = folder._children[1]._children[0].retentionSettings;
	assert.isFalse(settings.useServerDefaults);
	assert.equals(60, settings.daysToKeepHdrs);
	assert.equals(200, settings.numHeadersToKeep);

	settings = folder._children[1]._children[1].retentionSettings;
	assert.isFalse(settings.useServerDefaults);
	assert.equals(60, settings.daysToKeepHdrs);
	assert.equals(200, settings.numHeadersToKeep);
}

