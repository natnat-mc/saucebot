const searchers = Object.create(null);

const names = [
	'saucenao'
];
for(const name of names) searchers[name] = require(`./searchers/${name}`);

module.exports = searchers;
