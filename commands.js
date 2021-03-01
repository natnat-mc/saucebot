const commands = Object.create(null);

const names = [
	'ping',
	'eval',
	'sauce'
];
for(const name of names) commands[name] = require(`./commands/${name}`);

module.exports = commands;
