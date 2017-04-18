let inviteId;
let teamId;

const question1Value = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

module.exports = {
  'Create a team and invite someone': client => {
    // console.log('process.env', process.env);
    console.log('%c starting tests', 'background: green');
    const home = client.page.home();
    const teams = client.page.teams();
    const team = client.page.team();
    const teamInvite = client.page.teamInvite();

    const {
      TEST_EMAIL,
      TEST_PASSWORD,
      INVITEE_EMAIL,
      INVITEE_PASSWORD
    } = process.env;

    home.navigate()
      .waitForElementVisible('@loginCta', 1000)
      .click('@loginCta');

    client.pause(1000);
    client.window_handles(function(result) {
      console.log('switching windows:', result);
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
        console.log('inviteId--:', result.value);
        inviteId = result.value
      })
      .getValue('#invitee-0-team-id', result => {
        console.log('teamId--:', result.value);
        teamId = result.value
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
    } = process.env;

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
      .waitForElementVisible('#main-team', 1000)

    client.end();
  },

  'Start a meeting as an admin': client => {
    const home = client.page.home();
    const teams = client.page.teams();
    const team = client.page.team();
    const teamInvite = client.page.teamInvite();

    const {
      TEST_EMAIL,
      TEST_PASSWORD
    } = process.env;

    home.navigate()
      .waitForElementVisible('@loginCta', 1000)
      .click('@loginCta');

    client.pause(1000);
    client.window_handles(result => {
      client.switchWindow(result.value[1], () => {
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

    teams.waitForElementVisible('@teamPageContent', 1000);

    client.url(`http://localhost:3000/#/teams/${teamId}`);
    client.url(function (urltest) {
      console.log("URL is " + urltest.value);
    });

    client.waitForElementVisible('#team-member-list', 1000)
      .click('#team-member-list > li > a')
      .waitForElementVisible('#btn-start-meeting-now', 1000)
      .click('#btn-start-meeting-now')
      .waitForElementVisible('#question1', 1000)
      .setValue('#question1', question1Value);

    client.end();
  },

  'Delete team': client => {
    const home = client.page.home();
    const teams = client.page.teams();
    const team = client.page.team();
    const teamInvite = client.page.teamInvite();

    const {
      TEST_EMAIL,
      TEST_PASSWORD
    } = process.env;

    home.navigate()
      .waitForElementVisible('@loginCta', 1000)
      .click('@loginCta');

    client.pause(1000);
    client.window_handles(result => {
      client.switchWindow(result.value[1], () => {
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

    teams.waitForElementVisible('@teamPageContent', 1000);

    client.url(`http://localhost:3000/#/teams/${teamId}`)
      .waitForElementVisible('#btn-main-team-more', 1000)
      .moveToElement('#btn-main-team-more', 10, 10, cb => console.log('moved to element', cb))
      .waitForElementVisible('#btn-delete-team', 1000)
      .click('#btn-delete-team')
      .pause(1000)
      .acceptAlert()
      .end()
  }
};
