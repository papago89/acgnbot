const request = require('request');

const token = '';

function issuesParser(issues) {
  return [].concat(issues).map((issue) => {
    return {
      title: issue.title,
      body: issue.body,
      createdAt: issue.created_at,
      number: issue.number,
      url: issue.html_url,
      user: issue.user.login,
      comments: issue.comments
    };
  });
}

function commentsParser(comments) {
  return [].concat(comments).map((comment) => {
    return {
      body: comment.body,
      createdAt: comment.created_at,
      url: comment.html_url,
      user: comment.user.login
    };
  });
}

function getOptions(url) {
  return {
    url: url,
    headers: {
      'accept': 'application/vnd.github.v3+json',
      'user-agent': 'Awesome-Octocat-App',
      'authorization': `token ${token}`,
      'content-type': 'application/json'
    }
  };
}

function getHandler(options, parser, callback) {
  request.get(options, (error, response, body) => {
    if (error || response.statusCode !== 200) {
      return callback(parser([]));
    }

    return callback(parser(JSON.parse(body)));
  });
}

function postHandler(options, requestBody, parser, callback) {
  requestBody = JSON.stringify(requestBody);
  options.form = requestBody;

  request.post(options, (error, response, body) => {
    if (error || response.statusCode !== 201) {
      return callback(parser([]));
    }

    return callback(parser(JSON.parse(body)));
  });
}

class GithubIssues {
  constructor(url = 'https://api.github.com/repos/papago89/acgn-stock-bot') {
    this.url = url;
  }

  getIssuesHandler(callback) {
    getHandler(getOptions(`${this.url}/issues`), issuesParser, callback);
  }

  getCommentsHandler(number, callback) {
    getHandler(getOptions(`${this.url}/issues/${number}/comments`), commentsParser, callback);
  }

  newIssueHandler(issue, callback) {
    postHandler(getOptions(`${this.url}/issues`), issue, issuesParser, callback);
  }

  newCommentHandler(number, comment, callback) {
    postHandler(getOptions(`${this.url}/issues/${number}/comments`), comment, commentsParser, callback);
  }
}

module.exports = GithubIssues;
