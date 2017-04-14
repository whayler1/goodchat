let inviteId;

module.exports = {
  'Create a team and invite someone': client => {
    const home = client.page.home();
    const teams = client.page.teams();
    const team = client.page.team();
    const teamInvite = client.page.teamInvite();

    const {
      TEST_EMAIL,
      TEST_PASSWORD,
      INVITEE_EMAIL,
      INVITEE_PASSWORD
    } = client.globals;

    home.navigate()
      .waitForElementVisible('@loginCta', 1000)
      .click('@loginCta');

    client.pause(1000);
    client.window_handles(function(result) {
      console.log('result:', result);
      var handle = result.value[1];
      client.switchWindow(handle, function() {
        client.waitForElementVisible('body', 1000)
          .waitForElementVisible('#Email', 1000)
          .setValue('#Email', TEST_EMAIL)
          .click('#next')
          .pause(1000)
          .waitForElementVisible('#PersistentCookie', 1000)
          .click('#PersistentCookie')
          .waitForElementVisible('#Passwd', 1000)
          .setValue('#Passwd', TEST_PASSWORD)
          .click('#signIn')
          .switchWindow(result.value[0]);
      });
    });

    teams.waitForElementVisible('@teamPageContent', 1000)
      .click('@createTeamBtn');

    team.waitForElementVisible('@nameInput', 1000)
      .setValue('@nameInput', 'test team')
      .waitForElementVisible('@createTeamBtn', 1000)
      .click('@createTeamBtn')
      .waitForElementVisible('@saveQuestionsBtn', 1000)
      .click('@saveQuestionsBtn')
      .waitForElementVisible('@inviteTeamMembersLink', 1000)
      .click('@inviteTeamMembersLink');

    teamInvite.waitForElementVisible('@emailInput', 1000)
      .setValue('@emailInput', 'foo')
      .click('@sendInviteBtn')
      .assert.containsText('.input-error-msg', 'Please provide a valid email.')
      .clearValue('@emailInput')
      .setValue('@emailInput', INVITEE_EMAIL)
      .click('@sendInviteBtn')
      .waitForElementVisible('#invitee-0-email', 1000)
      .assert.containsText('#invitee-0-email', INVITEE_EMAIL)
      .getValue('#invitee-0-invite-id', result => {
        console.log('result--:', result.value);
        inviteId = result.value
      })
      .click('@closeBtn');

    client.waitForElementVisible('#navbar-hamburger', 1000)
      .click('#navbar-hamburger')
      .waitForElementVisible('#btn-logout', 1000)
      .click('#btn-logout');

    client.end();
  },
  'Join a team': client => {
    console.log('--> inviteId', inviteId);
    const home = client.page.home();
    const teams = client.page.teams();
    const team = client.page.team();
    const teamInvite = client.page.teamInvite();

    const {
      INVITEE_EMAIL,
      INVITEE_PASSWORD
    } = client.globals;

    home.navigate()
      .waitForElementVisible('@loginCta', 1000)
      .click('@loginCta');

    client.pause(1000);
    client.window_handles(function(result) {
      console.log('result:', result);
      var handle = result.value[1];
      client.switchWindow(handle, function() {
        client.waitForElementVisible('body', 1000)
          .waitForElementVisible('#Email', 1000)
          .setValue('#Email', INVITEE_EMAIL)
          .click('#next')
          .pause(1000)
          .waitForElementVisible('#PersistentCookie', 1000)
          .click('#PersistentCookie')
          .waitForElementVisible('#Passwd', 1000)
          .setValue('#Passwd', INVITEE_PASSWORD)
          .click('#signIn')
          .switchWindow(result.value[0]);
      });
    });

    teams.waitForElementVisible('@teamPageContent', 1000);

    client.url(`http://localhost:3000/#/invites/accept/${inviteId}`);
    client.url(function (urltest) {
      console.log("URL is " + urltest.value);
    });
    client.waitForElementVisible('#btn-join-team', 1000)
      .click('#btn-join-team')
    client.pause(3000);

    client.end();
  }
};
