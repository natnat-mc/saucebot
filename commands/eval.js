const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

module.exports = exports = async ({msg, isOwner}) => {
	if(!isOwner) return false;
	const [, code] = msg.content.split(/```/g);
	const fn = new AsyncFunction('msg', 'bot', code.replace(/^(js|javascript)?\n?/, ''));
	const rst = await fn(msg, msg.client);
	console.log(rst);
	return '```json\n'+JSON.stringify(rst, null, ' ')+'```';
};
