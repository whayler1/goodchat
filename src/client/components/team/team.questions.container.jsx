import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { updateTeam } from './team.dux.js';
import questionDefaults from '../../questions/questions.js';
import _ from 'lodash';

class TeamQuestions extends Component {
  static propTypes = {
    team: PropTypes.object.isDefined,
    shouldHaveSubmit: PropTypes.bool,
    shouldShowSaveUI: PropTypes.bool,
    updateTeam: PropTypes.func.isRequired
  };

  state = {
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

  questionFormSubmit = _.debounce(() => {
    console.log('%cquestion form submit', 'background:lightblue');
    const teamId = this.props.team.id;

    this.props.updateTeam(teamId, _.pick(this.state, [1,2,3,4,5].map(n => `question${n}`)))
      .then(res => {
        this.setState({ isInFlight: false })
        analytics.track('questions-set', {
          category: 'team',
          teamId
        });
      })
      .catch(err => console.log('err updating team', err));
  }, 750);

  singleQuestionSubmit = _.debounce((question) => {
    console.log('question', question);
    this.props.updateTeam(this.props.team.id, { [question]: this.state[question] }).then(
      res => this.setState({ isInFlight: false })
    );
  }, 750);

  onQuestionFormSubmit = e => {
    e.preventDefault();
    return false;
  }

  onQuestionChange = e => {
    const { name } = e.target;
    this.setState({ [name]: e.target.value, isInFlight: true }, () => !this.props.shouldHaveSubmit && this.singleQuestionSubmit(name));
  };

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

  componentWillReceiveProps = nextProps => {
    const { team } = nextProps;

    if (team.id !== this.props.team.id) {
      this.resetState(team);
    }
  }

  render() {
    const {
      question1,
      question2,
      question3,
      question4,
      question5,
      shouldHaveSubmit
    } = this.props;
    const questionValues = [
      question1,
      question2,
      question3,
      question4,
      question5
    ];

    return (
      <form
        id="team-questions"
        name="team-questions"
        className="form"
        onSubmit={shouldHaveSubmit ? e => {e.preventDefault(); return false;} : this.onQuestionFormSubmit}
      >
        {(() => {
          const { isInFlight } = this.state;
          
          if (this.props.shouldShowSaveUI) {
            if (typeof isInFlight === 'boolean') {
              if (isInFlight) {
                return <span className="muted-text">Saving...</span>;
              } else {
                return <span className="muted-text">Saved</span>;
              }
            } else {
              return <span>&nbsp;</span>;
            }
          }
        })()}
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
                  autoFocus={index === 0}
                />
              <span className="input-group-addon input-group-addon-divided">
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
                        }, () => this.singleQuestionSubmit(qId));
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
        {shouldHaveSubmit && [
        <fieldset>
          <button
            type="button"
            className="btn-no-style btn-large team-set-name-submit"
            onClick={this.questionFormSubmit}
          >
            Save questions <i className="material-icons">add_circle_outline</i>
          </button>
        </fieldset>,
        <fieldset>
          <button
            type="button"
            className="btn-no-style btn-team-skip"
            onClick={this.questionFormSubmit}
          >
            Skip
          </button>
        </fieldset>]}
      </form>
    );
  }
}

export default connect(
  null,
  { updateTeam }
)(TeamQuestions);
