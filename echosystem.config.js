module.exports = {
	apps : [
		{
			name: "Nodechain",
			script: "./bin/www",
			watch: true,
			instances: 1,
			exec_mode: "cluster",
			increment_var : 'PORT',
			env: {
				"PORT": 3001,
				"NODE_ENV": "development",
				"MASTER_HOST" : "localhost",
				"MASTER_PORT" : "3000"
			}
		}
	]
}
