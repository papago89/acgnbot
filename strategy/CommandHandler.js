const fs = require('fs');

const OtherStrategy = require('./command/OtherStrategy.js');
const CommandMessage = require('./command/CommandMessage.js');

const infoPath = __dirname + '/commandInfo';
const botInfoPath = `${infoPath}/botInfo.json`;

class CommandHandler {
  constructor() {
    this.strategies = {};
    this.strategies['otherStrategy'] = new OtherStrategy(); // special strategy

    this.mappingStrategy = {};
    this.mappingStrategy['help'] = this.mappingStrategy['roll'] = this.mappingStrategy['mumi'] = this.strategies['otherStrategy'];

    this.botInfo = fs.readFileSync(botInfoPath, 'utf-8');
    this.botInfo = JSON.parse(this.botInfo);
  }

  processCommand(message, discordObject) {
    let command, lit;
    message = message.split('%%')[1];
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

  updateBotInfo() {
    fs.writeFile(botInfoPath, JSON.stringify(this.botInfo, null, '\t'), 'utf-8', function(err) {
      if (err) {
        throw err;
      }
      console.log('Saved!');
    });
  }
}

module.exports = CommandHandler;

