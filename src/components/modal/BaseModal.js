import React, { Component } from 'react'
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { getTranslate } from 'react-localize-redux';

import Spinner from './Spinner';
import Footer from './ModalFooter';
import '../../styles/components/modal.scss';

class BaseModal extends Component {

  componentDidMount() {
    global.jQuery(ReactDOM.findDOMNode(this)).modal('show');
    global.jQuery(ReactDOM.findDOMNode(this)).on('hidden.bs.modal', this.props.handleHideModal);
  }

  componentWillUnmount() {
    global.jQuery(this.modal).modal('hide');
  }

  render() {
    return (
      <div className="modal fade in" ref={(input) => {this.modal = input }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
              <h4 className="modal-title">{this.props.title}</h4>
            </div>
            <div className="modal-body">
              {this.props.showInProgress &&
                <div className='alert alert-info show-in-progress' role='alert'>
                  <Spinner />
                  <span>{this.props.translate(this.props.showInProgressMessage)}</span>
                </div>
              }
              {this.props.children}
            </div>
            <Footer buttons={this.props.buttons} />
          </div>
        </div>
      </div>
    );
  }
}

BaseModal.propTypes = {
  title: PropTypes.string.isRequired,
  showInProgressMessage: PropTypes.string,
  showInProgress: PropTypes.bool
};

BaseModal.defaultProps = {
  showInProgress: false,
  showInProgressMessage: 'modal.show_in_progress_message'
};

function mapStateToProps(state) {
  return {
    translate: getTranslate(state.locale),
  };
}

export default connect(mapStateToProps)(BaseModal)