module.exports = {
	apps : [
		{
			name: "Nodechain",
			script: "./bin/www",
			watch: true,
			env: {
				"PORT": 3000,
				"NODE_ENV": "development",
			}
		}
	]
}
