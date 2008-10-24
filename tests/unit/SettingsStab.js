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
