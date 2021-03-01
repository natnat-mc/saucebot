const Discord = require('discord.js');
const {token} = require('./config');
const {handleMessage/*, handleReaction*/} = require('./handlers');

const bot = new Discord.Client();

bot.on('message', handleMessage);
//bot.on('messageReactionAdd', handleReaction);

bot.login(token);
bot.on('ready', () => console.log("Bot ready!"));
