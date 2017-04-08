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
    return (
      <Modal closeFunc={this.modalCloseFunc}>
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
