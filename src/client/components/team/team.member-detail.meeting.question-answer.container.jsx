import React, { Component, PropTypes } from 'react';

import TextareaAutosize from 'react-textarea-autosize';
import ReactMarkdown from 'react-markdown';

export default class QuestionAnswer extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    question: PropTypes.string.isRequired,
    answer: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onDeleteQA: PropTypes.func.isRequired,
    isUser: PropTypes.bool.isRequired,
    isHost: PropTypes.bool.isRequired,
    isDone: PropTypes.bool.isRequired,
    hostImageUrl: PropTypes.string.isRequired,
    userImageUrl: PropTypes.string.isRequired,
    qaLength: PropTypes.number.isRequired
  };

  state = {
    isPreview: false
  }

  togglePreview = () => this.setState({ isPreview: !this.state.isPreview })

  render() {
    const {
      index,
      question,
      answer,
      onChange,
      onDeleteQA,
      isUser,
      isHost,
      isDone,
      hostImageUrl,
      userImageUrl,
      qaLength
    } = this.props;

    const { isPreview } = this.state;

    let isUserInput = false;
    if ((isHost && question) || (!isHost && answer)) {
      isUserInput = true;
    }

    return (
      <div className="clearfix">
        <div className="team-member-detail-qa-list-item-input-group">
          <div className="team-member-detail-qa-list-item-icon"
            style={{backgroundImage: `url(${hostImageUrl})`}}
          ></div>
          {(isHost && !isDone && !isPreview) &&
          <div className="team-member-detail-qa-list-item-input-wrap">
            <TextareaAutosize
              id={`question${index}`}
              name={`question${index}`}
              className={`form-control${ (!isHost || isDone) ? ' form-control-cosmetic' : '' }`}
              maxLength={5000}
              value={question}
              onChange={onChange}
              autoFocus={index < 2}
              placeholder="Ask a question"
            />
          </div>}
          {(() => {
            if (!isHost || isDone || isPreview) {
              if (question) {
                return <ReactMarkdown containerProps={{id: `question${index}`}} className={`team-member-detail-qa-list-item`} source={question}/>;
              } else {
                return <section id={`question${index}`} className="team-member-detail-qa-list-item team-member-detail-qa-list-item-no-comment"><i className="material-icons">more_horiz</i></section>;
              }
            }
          })()}
        </div>
        <div className="team-member-detail-qa-list-item-input-group">
          <div className="team-member-detail-qa-list-item-icon"
            style={{backgroundImage: `url(${userImageUrl})`}}
          ></div>
          {(isUser && !isDone && !isPreview) &&
          <div className="team-member-detail-qa-list-item-input-wrap">
            <TextareaAutosize
              id={`answer${index}`}
              name={`answer${index}`}
              className={`form-control${ (!isUser || isDone) ? ' form-control-cosmetic' : ''}`}
              maxLength={5000}
              value={answer}
              onChange={onChange}
              autoFocus={index < 2}
              placeholder="Click here to answer"
            />
          </div>}
          {(() => {
            if (!isUser || isDone || isPreview) {
              if (answer) {
                return <ReactMarkdown containerProps={{id: `answer${index}`}} className="team-member-detail-qa-list-item" source={answer}/>;
              } else {
                return <section id={`answer${index}`} className="team-member-detail-qa-list-item team-member-detail-qa-list-item-no-comment"><i className="material-icons">more_horiz</i></section>;
              }
            }
          })()}
        </div>
        {isHost && !isDone && (qaLength > 1 || typeof qaLength !== 'number') &&
        <ul className="pull-right inline-list meeting-qa-foot">
          {!isDone && isUserInput &&
          <li>
            {!isPreview &&
            <button
              id={`btn-preview-${index}`}
              className="btn-no-style"
              type="button"
              onClick={this.togglePreview}
            >
              Preview <i className="material-icons">remove_red_eye</i>
            </button>
            }
            {isPreview &&
            <button
              id={`btn-edit-${index}`}
              className="btn-no-style"
              type="button"
              onClick={this.togglePreview}
            >
              Edit <i className="material-icons">create</i>
            </button>
            }
          </li>}
          <li>
            <button
              className="btn-no-style"
              type="button"
              onClick={() => onDeleteQA(index)}
            >
              Delete <i className="material-icons">close</i>
            </button>
          </li>
        </ul>}
      </div>
    );
  }
}
