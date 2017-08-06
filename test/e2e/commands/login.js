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
  console.log('---> email', email, '\n-- password:'. password);

  home.navigate()
    .waitForElementVisible('@loginCta', 1000)
    .click('@loginCta');

  api.pause(1000)
    .window_handles((result) =>
      api.switchWindow(result.value[1], () =>
        api.waitForElementVisible('body', 1000)
          .waitForElementVisible('#identifierId', 10000)
          .setValue('#identifierId', email)
          .click('#identifierNext')
          .waitForElementVisible('input[type="password"]', 10000)
          .setValue('input[type="password"]', password)
          .click('#passwordNext')
          .switchWindow(result.value[0])
    )
  );

  teams.waitForElementVisible('@teamPageContent', 20000, () => self.emit('complete'));

  return self;
};

module.exports = Login;
