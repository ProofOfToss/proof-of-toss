import React, { Component } from 'react';
import { connect } from 'react-redux';
import store from '../../store';
import Link/*, { LinkedComponent }*/ from 'valuelink'
import { Input/*, TextArea, Select, Radio, Checkbox*/ } from 'valuelink/tags'
import { getTranslate } from 'react-localize-redux';
import TagsInput from 'react-tagsinput'
import 'react-tagsinput/react-tagsinput.css'
import { saveEvent } from '../../actions/pages/newEvent'

class EventForm extends Component {
  constructor(props) {
    super(props)

    this.handleTagsChange = this.handleTagsChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)

    this.state = {
      saving: false,
      formData: {
        name: 'test-' + (Math.random()),
        deposit: 1,
        tags: ['testTag']
      }
    }
  }

  handleTagsChange(tags) {
    this.setState({
      tags: tags
    })
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.saveEvent(this.state.formData);
  }

  render() {
    const nameLink = Link.state(this, 'formData').at('name')
      .check( v => v, this.props.translate('validation.required'))
      .check( v => v.length >= 3, this.props.translate('validation.event.name_is_too_short'));

    const depositLink = Link.state(this, 'formData').at('deposit')
      .check( v => !isNaN(parseFloat(v)), this.props.translate('validation.event.deposit_is_nan'))
      .check( v => parseFloat(v) >= 1, this.props.translate('validation.event.deposit_is_too_small'))
      .check( v => parseFloat(v) <= 1000000000, this.props.translate('validation.event.deposit_is_too_big'));

    return <form onSubmit={this.handleSubmit}>
      <div className={"form-group" + (nameLink.error ? ' has-error' : '')}>
        <label htmlFor="event[name]">{ this.props.translate('pages.new_event.form.name')}*</label>
        <Input valueLink={ nameLink } type='text' id="event[name]" className='form-control' />
        <span id="helpBlock" className="help-block">{ nameLink.error || '' }</span>
      </div>
      <div className={"form-group" + (depositLink.error ? ' has-error' : '')}>
        <label htmlFor="event[deposit]">{ this.props.translate('pages.new_event.form.deposit')}*</label>
        <Input valueLink={ depositLink } type='number' id="event[deposit]" className='form-control' />
        <span id="helpBlock" className="help-block">{ depositLink.error || '' }</span>
      </div>
      <div className="form-group">
        <label htmlFor="event[tags]">{ this.props.translate('pages.new_event.form.tags')}*</label>
        <TagsInput value={this.state.formData.tags} onChange={this.handleTagsChange} />
        {/*<Input valueLink={ tagsLink } type='text' id="event[tags]" className='form-control' data-role="tagsinput" />*/}
        {/*<span id="helpBlock" className="help-block">{ depositLink.error || '' }</span>*/}
      </div>
      <button type="submit" className="btn btn-default" disabled={nameLink.error || depositLink.error}>
        { this.props.translate('pages.new_event.form.submit')}
      </button>
    </form>;
  }
}

function mapStateToProps(state) {
  return {
    saving: state.newEvent.saving,
    translate: getTranslate(state.locale)
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    saveEvent: (formData) => {
      dispatch(saveEvent(formData))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EventForm);