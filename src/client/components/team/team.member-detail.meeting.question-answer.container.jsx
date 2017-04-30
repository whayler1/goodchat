import React, { Component, PropTypes } from 'react';

import TextareaAutosize from 'react-textarea-autosize';
import ReactMarkdown from 'react-markdown';

import _ from 'lodash';

function QAListItemInputGroup({
  value,
  isEditable,
  index,
  prefix,
  imgUrl,
  onChange,
  placeholder,
  togglePreview
}) {
  const textAreaConatinerProps = {
    id: `${prefix}${index}`
  };

  if (_.isFunction(togglePreview)) {
    Object.assign(textAreaConatinerProps, {
      onClick: togglePreview,
      style: { cursor: 'pointer' }
    })
  }

  return (
    <div className="team-member-detail-qa-list-item-input-group">
      <div className="team-member-detail-qa-list-item-icon"
        style={{backgroundImage: `url(${imgUrl})`}}
      ></div>
      {isEditable &&
      <div className="team-member-detail-qa-list-item-input-wrap">
        <TextareaAutosize
          id={`${prefix}${index}`}
          name={`${prefix}${index}`}
          className="form-control"
          maxLength={5000}
          value={value}
          onChange={onChange}
          autoFocus={index < 2}
          placeholder={placeholder}
        />
      </div>}
      {(() => {
        if (!isEditable) {
          if (value) {
            return <ReactMarkdown
              className="team-member-detail-qa-list-item team-markdown"
              source={value}
              containerProps={textAreaConatinerProps}
              escapeHtml={true}
            />;
          } else {
            return <section
              id={`${prefix}${index}`}
              className="team-member-detail-qa-list-item team-member-detail-qa-list-item-no-comment"
            >
              <i className="material-icons">more_horiz</i>
            </section>;
          }
        }
      })()}
    </div>
  );
}

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

  togglePreview = () => this.setState({ isPreview: !this.state.isPreview });

  onDeleteQA = () => this.props.onDeleteQA(this.props.index);

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
        <QAListItemInputGroup
          value={question}
          isEditable={(isHost && !isDone && !isPreview)}
          index={index}
          prefix={'question'}
          imgUrl={hostImageUrl}
          onChange={onChange}
          placeholder="Ask a question"
          togglePreview={!isDone && isHost && this.togglePreview}
        />
        <QAListItemInputGroup
          value={answer}
          isEditable={(!isHost && !isDone && !isPreview)}
          index={index}
          prefix={'answer'}
          imgUrl={userImageUrl}
          onChange={onChange}
          placeholder="Click here to answer"
          togglePreview={!isDone && !isHost && this.togglePreview}
        />
        {!isDone && (qaLength > 1 || typeof qaLength !== 'number') &&
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
              onClick={this.onDeleteQA}
            >
              Delete <i className="material-icons">close</i>
            </button>
          </li>
        </ul>}
      </div>
    );
  }
}
