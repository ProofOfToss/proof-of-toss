import React, { Component } from 'react'
import ReactDOM from 'react-dom';

class BaseModal extends Component {

  componentDidMount(){
    console.log(this.props);
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
              <h4 className="modal-title">Modal title</h4>
            </div>
            <div className="modal-body">
              {this.props.children}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary">Save changes</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default BaseModal