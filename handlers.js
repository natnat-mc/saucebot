const {prefix, owner} = require('./config');
const commands = require('./commands');

const WARN = String.fromCharCode(0x26A0, 0xFE0F);
const OK = String.fromCodePoint(0x1F44C);

const handleMessage = async msg => {
	if(msg.author.bot) return;
	if(!msg.content.startsWith(prefix)) return;
	const reply = msg.reference && await msg.channel.messages.fetch(msg.reference.messageID);
	const args = msg.content.split(/\s+/g);
	const cmd = args.shift().substr(prefix.length);
	const isOwner = msg.author.id == owner;
	const ctx = {
		msg, reply,
		cmd, args,
		isOwner
	};
	const command = commands[cmd];
	if(!command) return;
	try {
		let result = await command(ctx);
		if(typeof result == 'string' || typeof result == 'number') result = {status: 'ok', text: result};
		if(result === true || result === null || result === undefined) result = {status: 'ok'};
		if(result === false) result = {status: 'error'};
		if(result.status === undefined) result.status = 'ok';
		switch(result.status) {
			case 'ok':
				await msg.react(OK);
				break;
			case 'error':
				await msg.react(WARN);
				break;
		}
		if(result.text && result.data) {
			await msg.reply(result.text, result.data);
		} else if(result.text) {
			await msg.reply(result.text);
		} else if(result.data) {
			await msg.reply(result.data);
		}
	} catch(e) {
		await msg.react(WARN);
		await msg.reply("Command failed");
		console.error(e);
	}
};

/*const handleReaction = async ({message: msg, emoji}, user) => {
	if(user.bot) return;
	console.log(msg, emoji, user);
};*/

module.exports = {
	handleMessage//,
	//handleReaction
};
