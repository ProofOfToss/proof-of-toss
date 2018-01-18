import React, { Component } from 'react'
import ReactDOM from 'react-dom';

import Footer from './ModalFooter';

class BaseModal extends Component {

  componentDidMount() {
    global.jQuery(ReactDOM.findDOMNode(this)).modal('show');
    global.jQuery(ReactDOM.findDOMNode(this)).on('hidden.bs.modal', this.props.handleHideModal);
  }

  render() {
    return (
      <div className="modal fade in">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
              <h4 className="modal-title">{this.props.title}</h4>
            </div>
            <div className="modal-body">
              {this.props.children}
            </div>
            <Footer buttons={this.props.buttons} />
          </div>
        </div>
      </div>
    );
  }
}

export default BaseModal