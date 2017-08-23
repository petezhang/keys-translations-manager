module.exports = {
	/**
	 * If you change the configurations,
	 * don't forget to rebuild the code (npm run build) and
	 * restart the server (npm run start).
	*/
	server: {
		hostname: '192.168.14.111',
		address:'192.168.14.111',
		port: 3000
	},
	database: 'mongodb://localhost:27017/translationdb',
	locales: ['en-US', 'zh-CN','ja-JP'],
	projects: [ // make sure the ids are 'String' type
		{id:'p1', name:'Project A'},
                        {id:'p2', name:'Project B'}
	],
	enableNotifications: true
};
