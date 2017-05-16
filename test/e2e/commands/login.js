var util = require('util');
var events = require('events');
function Login() {
  events.EventEmitter.call(this);
}

util.inherits(Login, events.EventEmitter);

Login.prototype.command = function(email, password) {
  const self = this;
  const { api } = self.client;
  const home = api.page.home();
  const teams = api.page.teams();

  home.navigate()
    .waitForElementVisible('@loginCta', 1000)
    .click('@loginCta');

  api.pause(1000)
    .window_handles((result) =>
      api.switchWindow(result.value[1], () =>
        api.waitForElementVisible('body', 1000)
          .waitForElementVisible('#identifierId', 1000)
          .setValue('#identifierId', email)
          .click('#identifierNext')
          .pause(1000)
          .waitForElementVisible('input[type="password"]', 5000)
          .setValue('input[type="password"]', password)
          .click('#passwordNext')
          .switchWindow(result.value[0])
    )
  );

  teams.waitForElementVisible('@teamPageContent', 5000, () => self.emit('complete'));

  return self;
};

module.exports = Login;
