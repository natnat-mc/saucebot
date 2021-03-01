const {JSDOM} = require('jsdom');
const fetch = require('node-fetch');

module.exports = exports = async url => {
	const req = await fetch(`http://saucenao.com/search.php?url=${encodeURIComponent(url)}`);
	const res = await req.text();
	const dom = new JSDOM(res);
	const document = dom.window.document;
	return Array
		// yes the selector for nodes is ugly, no i can't do better
		.from(document.querySelectorAll('.result:not(.hidden):not(#result-hidden-notification)'))
		.map(div => {
			// general data
			const similarity = parseFloat(div.querySelector('.resultsimilarityinfo').textContent) / 100; // how close is the image to the original, 0-1; probably uses a nonlinear scale so idk
			const title = div.querySelector('.resulttitle').textContent; // might be something that is not a title, yes i know it's bad, no i can't do better, complain to saucenao, not me
			const url = div.querySelector('.resultcontent a')?.href;
			const img = div.querySelector('.resultimage img').src;

			// fetch more specific data for the nodes
			const data = [];
			Array
				.from(div.querySelectorAll('.resultcontentcolumn strong'))
				.forEach(strong => {
					// data title always exists
					const title = strong.textContent.replace(/:\s+$/, '');

					if(strong.nextSibling == strong.nextElementSibling && strong.nextSibling.tagName.toLowerCase() == 'br') {
						// sometimes we have a list of stuff and it's a pain in the ass to handle
						const list = [];
						let e = strong.nextSibling;
						while(e.tagName.toLowerCase() != 'strong') {
							if(e.tagName.toLowerCase() != 'br') sibs.push(e.textContent);
							e = e.nextSibling;
						}
						data.push({title, list});
					} else if(strong.nextSibling == strong.nextElementSibling && strong.nextSibling.tagName.toLowerCase() == 'a') {
						// ideally we want a simple link
						const url = strong.nextSibling.href;
						const text = strong.nextSibling.textContent;
						data.push({title, text, url});
					} else {
						// and sometimes we just get text
						const text = strong.nextSibling.textContent;
						data.push({title, text});
					}
				});

			// return our node
			return {
				similarity,
				title,
				url,
				img,
				data
			};
		});
};
