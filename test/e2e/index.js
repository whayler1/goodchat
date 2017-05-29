const _ = require('lodash');

const {
  TEST_EMAIL,
  TEST_PASSWORD,
  INVITEE_EMAIL,
  INVITEE_PASSWORD
} = process.env;

let inviteId;
let teamId;
let question1originalValue;
let question2originalValue;
let question3originalValue;
let question4originalValue;
let question5originalValue;

const question1Value = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
const question2Value = `Success isn't about the end result, it's about what you learn along the way.

- item one
- item two`
const question3Value = 'It\'s sometimes said that I\'m rebellious and I do things to push people\'s buttons, but I just like the challenge. Over the years I have learned that what is important in a dress is the woman who is wearing it. There is always an emotional element to anything that you make. I never look at other people\'s work. My mind has to be completely focused on my own illusions. Fashions fade, style is eternal.';
const question4Value = 'I feel that things happen for a reason and open up new opportunities. I am no longer concerned with sensation and innovation, but with the perfection of my style. You have to stay true to your heritage; that\'s what your brand is about. The key to my collections is sensuality. I love the 2000s because everyone started to love haute couture.';
const question5Value = 'I think it\'s the responsibility of a designer to try to break rules and barriers. All I did my first year at Vogue was Xerox. Fashion is always of the time in which you live. It is not something standing alone. But the grand problem, the most important problem, is to rejeuvenate women. To make women look young. Then their outlook changes. They feel more joyous. It\'s really easy to get colors right. It\'s really hard to get black - and neutrals - right. Black is certainly a color but it\'s also an illusion. The key to my collections is sensuality.';
const answer1Value = 'This is Answer one';
const answer2Value = 'This is Answer two';
const answer3Value = _.repeat('abcd ef gh', 501);
const answer4Value = 'This is Answer four';
const answer5Value = 'This is Answer five';

module.exports = {
  'Create a team and invite someone': client => {
    const teams = client.page.teams();
    const team = client.page.team();
    const teamInvite = client.page.teamInvite();

    client.login(TEST_EMAIL, TEST_PASSWORD);

    teams.click('@createTeamBtn');

    team.waitForElementVisible('@nameInput', 1000)
      .setValue('@nameInput', 'test team')
      .waitForElementVisible('@createTeamBtn', 1000)
      .click('@createTeamBtn')
      .waitForElementVisible('@question1Input', 1000)
      // JW: Check meeting autopopulates with default questions
      .getValue('@question1Input', result => question1originalValue = result.value)
      .getValue('@question2Input', result => question2originalValue = result.value)
      .getValue('@question3Input', result => question3originalValue = result.value)
      .getValue('@question4Input', result => question4originalValue = result.value)
      .getValue('@question5Input', result => question5originalValue = result.value)
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
      .getValue('#invitee-0-invite-id', result => inviteId = result.value)
      .getValue('#invitee-0-team-id', result => teamId = result.value)
      .click('@closeBtn');

    client.waitForElementVisible('#navbar-hamburger', 1000)
      .click('#navbar-hamburger')
      .waitForElementVisible('#btn-logout', 1000)
      .click('#btn-logout')
      .end();
  },

  'Join a team': client => {
    client.login(INVITEE_EMAIL, INVITEE_PASSWORD)
      .url(`http://localhost:3000/#/invites/accept/${inviteId}`)
      .waitForElementVisible('#btn-join-team', 1000)
      .click('#btn-join-team')
      .waitForElementVisible('#main-team', 3000)
      .end();
  },

  'Start a meeting as an admin': client => {
    const meetings = client.page.meetings();

    const todos = [
      'foo bar',
      'abc 123 efg 987'
    ];

    client.login(TEST_EMAIL, TEST_PASSWORD)
      .url(`http://localhost:3000/#/teams/${teamId}`)
      .waitForElementVisible('#team-member-list', 1000)
      .click('#team-member-list > li > a')
      .waitForElementVisible('#btn-start-meeting-now', 1000)
      .click('#btn-start-meeting-now')
      .waitForElementVisible('#question1', 1000)
      // JW: Make sure questions are original values on load
      .assert.value("#question1", question1originalValue)
      .assert.value("#question2", question2originalValue)
      .assert.value("#question3", question3originalValue)
      .assert.value("#question4", question4originalValue)
      .assert.value("#question5", question5originalValue);

    meetings.setValue('@newTodoInput', todos[0])
      .click('@newTodoAddBtn')
      .setValue('@newTodoInput', todos[1])
      .click('@newTodoAddBtn');

    client.elements('css selector', '.team-member-todo-list > li > .meeting-todo-form > .meeting-todo-form-text > p', listItems => {
        console.log('listItems', listItems);
        listItems.value.forEach((listItem, index) => {
          console.log('listItem:', listItem.ELEMENT);
          client.elementIdText(listItem.ELEMENT, text => {
            console.log('-> -> text:', text)});
            client.assert.equal(text.value, todos[index]);
        });
      });

    client.setValue('textarea[name="note"]', 'foo `bar_baz`, _italic_ **strong n bold**')
      .clearValue('#question1')
      .setValue('#question1', question1Value)
      .clearValue('#question2')
      .setValue('#question2', question2Value)
      .click('#btn-preview-2')
      .assert.containsText('#question2 >ul >li:first-child', 'item one')
      .clearValue('#question3')
      .setValue('#question3', question3Value)
      .clearValue('#question4')
      .setValue('#question4', question4Value)
      .clearValue('#question5')
      .setValue('#question5', question5Value)
      // JW: Test note/markdown behavior
      .assert.containsText('.team-markdown-note >p >code', 'bar_baz')
      .assert.containsText('.team-markdown-note >p >em', 'italic')
      .assert.containsText('.team-markdown-note >p >strong', 'strong n bold')
      .click('.team-markdown-note')
      .waitForElementVisible('textarea[name="note"]', 1000)
      // JW: Need to pause to allow value to sumbit
      .pause(1500)
      .end();
  },

  'Fill out meeting answers': client => {
    client.login(INVITEE_EMAIL, INVITEE_PASSWORD)
      .url(`http://localhost:3000/#/teams/${teamId}`)
      .waitForElementVisible('#team-member-list', 1000)
      .click('#team-member-list > li > a')
      .waitForElementVisible('#answer1', 1000)
      .assert.containsText('#question1 >p', question1Value)
      // JW: A little bit of markdown support testing
      .assert.containsText('#question2 >p', 'Success isn\'t about the end result, it\'s about what you learn along the way.')
      .assert.containsText('#question2 >ul >li:first-child', 'item one')
      .assert.containsText('#question3 >p', question3Value)
      .assert.containsText('#question4 >p', question4Value)
      .assert.containsText('#question5 >p', question5Value)
      .setValue('textarea[name="note"]', 'lorem ipsum')
      .setValue('#answer1', answer1Value)
      .setValue('#answer2', answer2Value)
      .setValue('#answer3', answer3Value)
      .setValue('#answer4', answer4Value)
      .click('#btn-answers-ready')
      .waitForElementVisible('.danger-text', 1000)
      .assert.containsText('.danger-text', 'Please answer every question')
      .setValue('#answer5', answer5Value)
      .assert.containsText('.team-markdown-note >p', 'lorem ipsum')
      .click('#btn-answers-ready')
      // #JW: Need to pause to allow value to sumbit
      .pause(1500)
      .end();
  },

  'Complete Meeting': client => {
    client.login(TEST_EMAIL, TEST_PASSWORD)
      .url(`http://localhost:3000/#/teams/${teamId}`)
      .waitForElementVisible('#team-member-list', 1000)
      .click('#team-member-list > li > a')
      .waitForElementVisible('.main-team-meeting', 1000)
      .click('#btn-complete-meeting')
      .waitForElementNotPresent('.main-team-meeting', 1000)
      .click('#team-member-list > li > a')
      .waitForElementVisible('.main-team-meeting', 1000)
      .assert.elementNotPresent('#btn-complete-meeting')
      .end();
  },

  'Delete team': client => {
    client.login(TEST_EMAIL, TEST_PASSWORD)
      .url(`http://localhost:3000/#/teams/${teamId}`)
      .waitForElementVisible('#team-member-list', 1000)
      .click('#team-member-list > li > a')
      .waitForElementVisible('#answer1', 1000)
      .assert.containsText('#answer1 >p', answer1Value)
      .assert.containsText('#answer2 >p', answer2Value)
      .assert.containsText('#answer3 >p', answer3Value.substr(0, 5000))
      .assert.containsText('#answer4 >p', answer4Value)
      .assert.containsText('#answer5 >p', answer5Value)
      .click('.page-header-back-link')
      .waitForElementVisible('#btn-main-team-more', 1000)
      .moveToElement('#btn-main-team-more', 10, 10, cb => console.log('moved to element', cb))
      .waitForElementVisible('#btn-delete-team', 1000)
      .click('#btn-delete-team')
      .pause(1000)
      .acceptAlert()
      // JW: pause to allow team to be deleted
      .pause(1500)
      .end()
  }
};
