import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import superagent from 'superagent';
import _ from 'underscore';
import questionDefaults from '../../questions/questions.js';

class Team extends Component {
  static propTypes = {
    team: PropTypes.object.isRequired,
    members: PropTypes.array.isRequired
  };
  state = {
    name: this.props.team.name || '',
    question1: this.props.team.question1 || questionDefaults[0][0],
    question2: this.props.team.question2 || questionDefaults[1][0],
    question3: this.props.team.question3 || questionDefaults[2][0],
    question4: this.props.team.question4 || questionDefaults[3][0],
    question5: this.props.team.question5 || questionDefaults[4][0],
    isQuestion1DropdownVisible: false,
    isQuestion2DropdownVisible: false,
    isQuestion3DropdownVisible: false,
    isQuestion4DropdownVisible: false,
    isQuestion5DropdownVisible: false,
    elRef: null
  };
  onTeamNameSubmit = e => {
    e.preventDefault();
    this.submit();
    return false;
  };
  submit = _.debounce(() => {
    superagent.put(`team/${this.props.params.teamId}`)
    .send({ name: this.state.name })
    .then(
      res => {
        console.log('success updating', res);
      },
      err => console.log('error updating team name')
    );
  }, 500);
  onChange = e => {
    const { value, name } = e.target;
    this.setState({ [name]: value }, this.submit);
  };
  onDeleteClick = () => {
    superagent.delete(`team/${this.props.params.teamId}`)
    .then(
      res => {
        console.log('delete success', res);
        this.props.router.push(`teams`);
      },
      err => console.log('error deleting team', err)
    );
  }
  onQuestionFormSubmit = e => {
    e.preventDefault();
    console.log('question form submit');
    return false;
  }
  onQuestionChange = e => this.setState({ [e.target.name]: e.target.value });

  onBodyClick = e => {
    const { elRef } = this.state;
    if (elRef && !elRef.contains(e.target)) {
      this.closeDropdowns();
    }
  };

  closeDropdowns = () => this.setState({
    isQuestion1DropdownVisible: false,
    isQuestion2DropdownVisible: false,
    isQuestion3DropdownVisible: false,
    isQuestion4DropdownVisible: false,
    isQuestion5DropdownVisible: false,
    elRef: null
  });

  componentDidUpdate() {
    if (this.state.elRef) {
      document.body.addEventListener('click', this.onBodyClick);
    } else {
      document.body.removeEventListener('click', this.onBodyClick);
    }
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.onBodyClick);
  }

  render() {
    const {
      members,
      question1,
      question2,
      question3,
      question4,
      question5
    } = this.props;
    const questionValues = [
      question1,
      question2,
      question3,
      question4,
      question5
    ];
    const { is_owner, is_admin, id } = this.props.team;

    return (
      <main role="main">
        <header className="page-header">
          <form
            className="form"
            name="team-name-form"
            onSubmit={this.onTeamNameSubmit}
          >
            <div className={`input-group input-group-h1 ${ is_owner ? 'input-group-seamless' : 'input-group-cosmetic'}`}>
              <input
                className="form-control"
                type="text"
                name="name"
                placeholder="Untitled Team"
                maxLength={50}
                readOnly={!is_owner}
                value={this.state.name}
                autoComplete="off"
                onChange={this.onChange}
              />
              <span className="input-group-addon">
                <i className="material-icons">mode_edit</i>
              </span>
            </div>
          </form>
        </header>
        <div className="page-body">
          <section>
            <h3>Questions</h3>
            <form
              id="team-questions"
              name="team-questions"
              className="form"
              onSuccess={this.onQuestionFormSubmit}
            >
              {questionValues.map((question, index) => {
                const qId = `question${index + 1}`;
                const elRef = `${qId}El`;
                const stateName = `isQuestion${index + 1}DropdownVisible`;
                const onDropdownToggle = () => {
                  const isVisible = this.state[stateName];
                  if (!isVisible) {
                    this.setState({
                      [stateName]: true,
                      elRef: this[elRef]
                    });
                  } else {
                    this.closeDropdowns();
                  }
                };
                return (
                  <fieldset>
                    <div className="input-group" ref={el => this[elRef] = el}>
                      <input
                        id={qId}
                        name={qId}
                        type="text"
                        className="form-control"
                        value={this.state[qId]}
                        onChange={this.onQuestionChange}
                      />
                      <span className="input-group-addon">
                        <button
                          type="button"
                          className="btn-no-style"
                          onClick={onDropdownToggle}
                        >
                          <i className="material-icons">keyboard_arrow_down</i>
                        </button>
                      </span>
                      <div className={`dropdown-container${this.state[stateName] ? ' dropdown-container-show' : ''}`}>
                        <div className="dropdown">
                          <ul className="dropdown-list">
                            {questionDefaults[index].map((question, innerIndex) => {
                              const onDropdownItemClick = () => this.setState({
                                [qId]: question,
                                isQuestion1DropdownVisible: false,
                                isQuestion2DropdownVisible: false,
                                isQuestion3DropdownVisible: false,
                                isQuestion4DropdownVisible: false,
                                isQuestion5DropdownVisible: false,
                                elRef: null
                              });
                              return (
                                <li key={`${index}${innerIndex}`}>
                                  <a onClick={onDropdownItemClick}>
                                    {question}
                                  </a>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </fieldset>
                )
              })}
            </form>
          </section>
          <section>
            <h3>Team members</h3>
            {(is_owner || is_admin) && members.length < 1 &&
            <p>This team has no members. Click below to invite team members.</p>}
            {members.length > 0 && <ul>
              {members.map(member => <li key={member.id}>
                {member.email}
              </li>)}
            </ul>}
          </section>
          <ul className="footer-btn-list">
            {(is_owner || is_admin) &&
            <li>
              <Link className="btn-secondary btn-block" to={`teams/${id}/invite`}>
                Invite team members <i className="material-icons">person_add</i>
              </Link>
            </li>}
            {is_owner &&
            <li>
              <button className="btn-secondary btn-block" type="button" onClick={this.onDeleteClick}>
                Delete this team <i className="material-icons">delete</i>
              </button>
            </li>}
          </ul>
        </div>
      </main>
    );
  }
}

export default connect(
  state => {
    return {
      team: state.team.team,
      members: state.team.members.filter(member => member.id !== state.user.id),
    };
  },
  {}
)(Team);
