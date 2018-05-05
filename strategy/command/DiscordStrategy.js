const Strategy = ('./Strategy');

class DiscordStrategy extends Strategy.constructor {
  constructor() {
    super();
    this.commandFunction = {};
    this.commandFunction['setgame'] = (commandMessage, discordObject) => {
      discordObject.client.user.setGame(commandMessage.type);

      return [];
    };
    this.commandFunction['setrole'] = (commandMessage, discordObject) => {
      const role = discordObject.message.guild.roles.find('name', commandMessage.context);
      const member = discordObject.message.mentions.members.first();
      member.addRole(role).catch(console.error);

      return [];
    };
  }

  processCommand(commandMessage, discordObject, handler) {

    return this.commandFunction[commandMessage.command](commandMessage, discordObject);
  }
}

module.exports = DiscordStrategy;
