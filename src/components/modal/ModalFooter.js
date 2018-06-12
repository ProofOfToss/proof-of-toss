import React, { Component } from 'react'
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';

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

  componentWillMount() {
    if (!this.props.buttons) {
      this.props.defaultButtons[0].title = this.props.translate('buttons.close');
      this.props.defaultButtons[1].title = this.props.translate('buttons.save');
    }
  }


  render() {
    const buttons = this.props.buttons ? this.props.buttons : this.props.defaultButtons;

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

const mapStateToProps = state => ({
  translate: getTranslate(state.locale)
});

export default connect(mapStateToProps)(ModalFooter);