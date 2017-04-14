module.exports = {
  url: function() {
    return this.api.launchUrl + '/teams';
  },
  elements: {
    teamPageContent: {
      selector: '#main-teams'
    },
    createTeamBtn: {
      selector: '#btn-create-team'
    }
  }
};
