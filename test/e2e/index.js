module.exports = {
  'Login': function (client) {
    const home = client.page.home();
    const teams = client.page.teams();
    const team = client.page.team();
    const teamInvite = client.page.teamInvite();

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
          .setValue('#Email', client.globals.TEST_EMAIL)
          .click('#next')
          .pause(1000)
          .waitForElementVisible('#Passwd', 1000)
          .setValue('#Passwd', client.globals.TEST_PASSWORD)
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

    client.end();
  }
  // 'Home Page' : function (browser) {
  //   browser
  //     .url('http://localhost:3000')
  //     .waitForElementVisible('body', 1000)
  //     .end();
    // browser
    //   .url('http://www.google.com')
    //   .waitForElementVisible('body', 1000)
    //   .setValue('input[type=text]', 'nightwatch')
    //   .waitForElementVisible('button[name=btnG]', 1000)
    //   .click('button[name=btnG]')
    //   .pause(1000)
    //   .assert.containsText('#main', 'Night Watch')
    //   .end();
  // }
};
