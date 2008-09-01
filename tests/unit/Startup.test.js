utils.include('../../components/Startup.js');
utils.include('FolderStab.js');

function createSettingsStab()
{
	return [
		{
			pattern                : '子1',
			useServerDefaults      : false,
			retainByPreference     : 0,
			daysToKeepHdrs         : 30,
			numHeadersToKeep       : 100,
			keepUnreadMessagesOnly : false,
			cleanupBodiesByDays    : false,
			daysToKeepBodies       : 30
		},
		{
			pattern                : '孫[34]',
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

var folder;
var service;

function setUp()
{
	folder = createFolderStab();

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
	assert.equals(2, parsed.length);
	assert.pattern('子1', parsed[0].pattern);
	assert.notPattern('子2', parsed[0].pattern);
	assert.pattern('孫3', parsed[1].pattern);
	assert.notPattern('孫2', parsed[1].pattern);
}
