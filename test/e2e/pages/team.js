module.exports = {
  url: function() {
    return this.api.launchUrl + '/teams/:uuid';
  },
  elements: {
    nameInput: {
      selector: '#name'
    },
    createTeamBtn: {
      selector: '#btn-create-team'
    },
    question1Input: {
      selector: '#question1'
    },
    question2Input: {
      selector: '#question2'
    },
    question3Input: {
      selector: '#question3'
    },
    question4Input: {
      selector: '#question4'
    },
    question5Input: {
      selector: '#question5'
    },
    saveQuestionsBtn: {
      selector: '#btn-save-questions'
    },
    inviteTeamMembersLink: {
      selector: '#link-invite-team-members'
    }
  }
};
