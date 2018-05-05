const Strategy = ('./Strategy');

class SayStrategy extends Strategy.constructor {
  constructor() {
    super();
    this.commandFunction = {};
    this.commandFunction['say'] = (commandMessage) => {
      
      return [{
        embed: false,
        image: false,
        content: commandMessage.lit
      }];
    };
  }

  processCommand(commandMessage, discordObject, handler) {
    return this.commandFunction['say'](commandMessage);
  }
}

module.exports = SayStrategy;
