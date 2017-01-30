import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import superagent from 'superagent';
import _ from 'lodash';
import questionDefaults from '../../questions/questions.js';
import TeamMemberListItem from './team.member-list-item.component.jsx';

import TeamHeader from './team.header.container.jsx';

import Helmet from "react-helmet";

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

  resetState = team => this.setState({
    name: team.name || '',
    question1: team.question1 || questionDefaults[0][0],
    question2: team.question2 || questionDefaults[1][0],
    question3: team.question3 || questionDefaults[2][0],
    question4: team.question4 || questionDefaults[3][0],
    question5: team.question5 || questionDefaults[4][0],
    isQuestion1DropdownVisible: false,
    isQuestion2DropdownVisible: false,
    isQuestion3DropdownVisible: false,
    isQuestion4DropdownVisible: false,
    isQuestion5DropdownVisible: false,
    elRef: null
  });

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

  questionFormSubmit = _.debounce(() => {
    console.log('%cquestion form submit', 'background:lightblue');
    const {
      question1,
      question2,
      question3,
      question4,
      question5
    } = this.state;

    superagent.put(`team/${this.props.team.id}`)
      .send({
        question1,
        question2,
        question3,
        question4,
        question5
      })
      .end((err, res) => {
        if (err) {
          return console.log('%cerr putting team', 'background:pink', res);
        }
        console.log('%csuccess updating team!', 'background:yellowgreen', res);
      });
  }, 750);

  onQuestionFormSubmit = e => {
    e.preventDefault();

    this.questionFormSubmit();

    return false;
  }

  onQuestionChange = e => this.setState({ [e.target.name]: e.target.value }, this.questionFormSubmit);

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

  componentWillReceiveProps = nextProps => {
    const { team } = nextProps;

    if (team.id !== this.props.team.id) {
      console.log('nextprops.team.id !== this.props.team.id');
      this.resetState(team);
    }
  }

  componentDidUpdate = () => {
    if (this.state.elRef) {
      document.body.addEventListener('click', this.onBodyClick);
    } else {
      document.body.removeEventListener('click', this.onBodyClick);
    }
  }

  componentWillUnmount = () => {
    document.body.removeEventListener('click', this.onBodyClick);
  }

  render = () => {
    const {
      team,
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

    console.log('members:', members);

    return (
      <div>
        <TeamHeader/>
        <main className="main" role="main">
          <Helmet
            title={this.state.name}
          />
          <div className="col">
            <section className="card">
              <h3>Questions</h3>
              <form
                id="team-questions"
                name="team-questions"
                className="form"
                onSubmit={this.onQuestionFormSubmit}
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
                                }, this.questionFormSubmit);
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
          </div>
          <div className="col">
            <section className="card">
              <header className="card-header">
              <h3>Team members</h3>
              </header>
              <div className="card-padded-content">
                {(is_owner || is_admin) && members.length < 1 &&
                <p>This team has no members. Click below to invite team members.</p>}
                {members.length > 0 && <ul className="team-member-list">
                  {members.map(member => <li key={member.id}>
                    <TeamMemberListItem
                      givenName={member.given_name}
                      familyName={member.family_name}
                      email={member.email}
                      picture={member.picture}
                      id={member.id}
                      teamId={team.id}
                    />
                  </li>)}
                </ul>}
              </div>
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
            </section>
          </div>
        </main>
      </div>
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
