const RssFeedFilter = require('./RssFeedFilter');
const Discord = require('discord.js');

class RssDiscordSender extends RssFeedFilter {
  constructor(channel, filter = {}, cycleMilliseconds = 60000) {
    super(filter, cycleMilliseconds);
    this.channel = channel;
  }

}

module.exports = RssDiscordSender;
