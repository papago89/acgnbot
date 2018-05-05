const fs = require('fs');

const OtherStrategy = require('./command/OtherStrategy');
const SayStrategy = require('./command/SayStrategy');
const DiscordStrategy = require('./command/DiscordStrategy');
const CommandMessage = require('./command/CommandMessage');
const RssStrategy = require('./command/RssStrategy');

const infoPath = __dirname + '/commandInfo';
const botInfoPath = `${infoPath}/botInfo.json`;
const rssConfigPath = `${infoPath}/rssConfig.json`;

class CommandHandler {
  constructor(handles) {
    this.strategies = {};
    this.strategies['otherStrategy'] = new OtherStrategy(); // special strategy
    this.strategies['sayStrategy'] = new SayStrategy();
    this.strategies['discordStrategy'] = new DiscordStrategy();
    this.strategies['rssStrategy'] = new RssStrategy(handles.rssHandle);

    this.mappingStrategy = {};
    this.mappingStrategy['help'] = this.mappingStrategy['roll'] = this.mappingStrategy['mumi'] = this.strategies['otherStrategy'];
    this.mappingStrategy['say'] = this.strategies['sayStrategy'];
    this.mappingStrategy['setgame'] = this.mappingStrategy['setrole'] = this.strategies['discordStrategy'];
    this.mappingStrategy['newrss'] = this.mappingStrategy['deleteotherrss'] = this.mappingStrategy['initrsssenders'] = this.strategies['rssStrategy'];

    this.botInfo = fs.readFileSync(botInfoPath, 'utf-8');
    this.botInfo = JSON.parse(this.botInfo);
    this.rssConfig = fs.readFileSync(rssConfigPath, 'utf-8');
    this.rssConfig = JSON.parse(this.rssConfig);
  }

  processCommand(message, discordObject) {
    let command, lit;
    command = message.split(/\s/)[0].toLowerCase();
    lit = message.substr(command.length + 1);

    return this.mappingHandler(command, lit, discordObject);
  }

  mappingHandler(command, lit, discordObject) {
    if (this.mappingStrategy[command] !== undefined) {

      return this.mappingStrategy[command].processCommand(new CommandMessage(command, lit), discordObject, this);
    }

    return this.strategies['otherStrategy'].processCommand(new CommandMessage(command, lit), discordObject, this);
  }

  updateJsonFile() {
    fs.writeFile(botInfoPath, JSON.stringify(this.botInfo, null, '\t'), 'utf-8', function(err) {
      if (err) {
        throw err;
      }
      console.log('Saved! botInfo');
    });
    fs.writeFile(rssConfigPath, JSON.stringify(this.rssConfig, null, '\t'), 'utf-8', function(err) {
      if (err) {
        throw err;
      }
      console.log('Saved! rssConfig');
    });
  }
}

module.exports = CommandHandler;

