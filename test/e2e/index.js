module.exports = {
  'Basic app usage': function (client) {
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

    client.end();
  }
};
