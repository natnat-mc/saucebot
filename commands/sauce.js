const Discord = require('discord.js');
const searchers = require('../searchers');

const block = (txt, fmt='') => "```"+fmt+"\n"+txt+"```";
const jsonblock = data => block(JSON.stringify(data, null, '\t'), 'json');

module.exports = exports = async ({msg, reply, args}) => {
	const urls = args.concat(
		reply
			? reply.attachments
				.map(x => x.url)
				.concat(
					Array.from(reply.content.matchAll(/https?:\/\/\S+/g)).map(x => x[0])
				)
			: []
	);
	if(!urls.length) return {status: 'error', text: "No URL in sauce request"};
	if(urls.length > 5) return {status: 'error', text: "Too many URLs in sauce request"};

	const fullResults = [];
	for(const url of urls) {
		const results = [];
		let topResult, topScore = 0;
		for(const searcherName in searchers) {
			const searcher = searchers[searcherName];
			try {
				const result = await searcher(url);
				result.forEach(x => {
					if(x.similarity > topScore) {
						topScore = x.similarity;
						topResult = {searcher: searcherName, ...x};
					}
				});
				results.push({searcher: searcherName, result});
			} catch(e) {
				console.error(e);
			}
		}
		fullResults.push({url, results, topResult});
	}

	return {
		status: 'ok',
		text: (
			`Found ${fullResults.filter(x => x.topResult).length} results out of ${urls.length}\n` +
			fullResults
				.map(x => `- <${x.url}>: ${x.topResult ? `found (${x.topResult.similarity*100}% similarity, ${x.topResult.searcher})` : "not found"}`)
				.join('\n')
		),
		data: [
			new Discord.MessageAttachment(Buffer.from(JSON.stringify(fullResults), 'utf8'), 'fullResults.json')
		].concat(
			fullResults
				.filter(x => x.topResult)
				.map(x => {
					const embed = new Discord.MessageEmbed();
					embed.setFooter(x.url);
					embed.setAuthor(x.url, x.url, x.url);
					embed.setImage(x.topResult.img);
					embed.setURL(x.topResult.URL);
					embed.setTitle(x.topResult.title);
					embed.setDescription(`Found on ${x.topResult.searcher} with ${x.topResult.similarity*100}% similarity at ${x.topResult.url}`);
					for(const field of x.topResult.data) {
						if(field.list) {
							embed.addField(field.title, field.list.join('\n'), false);
						} else if(field.url) {
							embed.addField(field.title, field.text+'\n'+field.url, false);
						} else {
							embed.addField(field.title, field.text, false);
						}
					}
					return embed;
				})
		)
	};
};
