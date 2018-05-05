const Strategy = ('./Strategy');
const GithubIssues = require('../../GithubIssues/GithubIssues');


function issuesToMessage(issues) {
  return issues.slice(0, 10).reduce((str, issue) => {
    return `${str}${issue.number} : ${issue.title}\nCommets : ${issue.comments}\n${issue.url}\n\n`;
  }, '');
}

function commentsToMessage(comments) {
  return comments.slice(0, 10).reduce((str, comment) => {
    return `${str}${comment.body}\n${comment.url}\n\n`;
  }, '');
}

class IssueStrategy extends Strategy.constructor {
  constructor(url, handler) {
    super();
    this.commandFunction = {};
    this.githubIssues = new GithubIssues(url);

    this.commandFunction['issueslist'] = (commandMessage, discordObject) => {
      this.githubIssues.getIssuesHandler((issues) => {
        handler([{embed:true, image:false, content:issuesToMessage(issues)}], discordObject.message.channel);
      });

      return [];
    };

    this.commandFunction['commentslistfor'] = (commandMessage, discordObject) => {
      this.githubIssues.getCommentsHandler(commandMessage.type, (comments) => {
        handler([{embed:true, image:false, content:commentsToMessage(comments)}], discordObject.message.channel);
      });

      return [];
    };

    this.commandFunction['newissue'] = (commandMessage, discordObject) => {
      const userName = (discordObject.message.member.nickname == null) ? discordObject.message.author.username : discordObject.message.member.nickname;
      const issue = {
        'title': `${userName} - ${commandMessage.type}`,
        'body': `${userName}:\n${commandMessage.context}`
      };

      this.githubIssues.newIssueHandler(issue, (issues) => {
        handler([{embed:true, image:false, content:issuesToMessage(issues)}], discordObject.message.channel);
      });

      return [];
    };

    this.commandFunction['newcommentfor'] = (commandMessage, discordObject) => {
      const userName = (discordObject.message.member.nickname == null) ? discordObject.message.author.username : discordObject.message.member.nickname;
      const comment = {
        'body': `${userName}:\n${commandMessage.context}`
      };

      this.githubIssues.newCommentHandler(commandMessage.type, comment, (comments) => {
        handler([{embed:true, image:false, content:commentsToMessage(comments)}], discordObject.message.channel);
      });

      return [];
    };
  }

  processCommand(commandMessage, discordObject, handler) {

    return this.commandFunction[commandMessage.command](commandMessage, discordObject);
  }
}

module.exports = IssueStrategy;




