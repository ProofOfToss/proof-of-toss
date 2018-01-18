import React, { Component } from 'react'

class ModalFooter extends Component {

  static defaultProps = {
    defaultButtons: [{
      title: 'Close',
      className: 'btn-default',
      attrs: {
        'data-dismiss': 'modal'
      }
    },
    {
      title: 'Save',
      className: 'btn-primary'
    }]
  }

  render() {
    const buttons = this.props.buttons ? this.props.buttons : this.props.defaultButtons

    return (
      <div className="modal-footer">
        {buttons.map(function(button, index) {
          return <button key={ index } type="button" className={`btn ${ button.className }`}
                         { ...button.attrs } { ...button.actions }>{ button.title }</button>;
        })}
      </div>
    );
  }
}

export default ModalFooter