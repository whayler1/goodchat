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
    saveQuestionsBtn: {
      selector: '#btn-save-questions'
    },
    inviteTeamMembersLink: {
      selector: '#link-invite-team-members'
    }
  }
};
