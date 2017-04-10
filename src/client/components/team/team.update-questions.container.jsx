import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import TeamQuestions from './team.questions.container.jsx';
import { Link } from 'react-router';
import Modal from '../modal/modal.container.jsx';
import Helmet from "react-helmet";

class TeamUpdateQuestions extends Component {
  static propTypes = {
    team: PropTypes.object.isRequired
  }

  modalCloseFunc = () => this.props.history.push(`teams/${this.props.team.id}`);

  render() {
    const { team } = this.props
    const { name } = team;
    const closeFunc = this.modalCloseFunc;
    return (
      <Modal closeFunc={closeFunc}>
        <Helmet title={`Update default questions for ${name} | Good Chat`}/>
        <section className="card">
          <header className="card-header">
            <h3>Update default questions for {name}</h3>
            <div className="card-header-close">
              <Link to={`teams/${team.id}`}>
                <i className="material-icons">close</i>
              </Link>
            </div>
          </header>
          <div className="card-padded-content">
            <p>These are the default questions any time you start a meeting. You can update these at any time, or change them ad-hoc when you start a meeting.</p>
            <TeamQuestions
              team={team}
              shouldShowSaveUI={true}
            />
          </div>
          <div className="card-padded-content align-right">
            <ul className="stacked-to-inline-list">
              <li>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeFunc}
                >Close</button>
              </li>
            </ul>
          </div>
        </section>
      </Modal>
    );
  }
}

export default connect(
  state => ({
    team: state.team.team
  })
)(TeamUpdateQuestions);
