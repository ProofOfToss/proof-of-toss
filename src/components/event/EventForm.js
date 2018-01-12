import React, { Component } from 'react';
import { strings } from '../../util/i18n';
import Link/*, { LinkedComponent }*/ from 'valuelink'
import { Input/*, TextArea, Select, Radio, Checkbox*/ } from 'valuelink/tags'

class EventForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      name: 'test-' + (Math.random()),
      deposit: 1
    }
  }

  render() {
    const nameLink = Link.state(this, 'name')
      .check( v => v, strings().validation.required)
      .check( v => v.length >= 3, strings().validation.event.name_is_too_short);

    const depositLink = Link.state(this, 'deposit')
      .check( v => !isNaN(parseFloat(v)), strings().validation.event.deposit_is_nan)
      .check( v => parseFloat(v) >= 1, strings().validation.event.deposit_is_too_small)
      .check( v => parseFloat(v) <= 1000000000, strings().validation.event.deposit_is_too_big);

    return <form {...this.props}>
      <div>
        <label>
          {strings().form.event.name}*
          <Input valueLink={ nameLink } type='text' />
          <div className='error-placeholder'>{ nameLink.error || '' }</div>
        </label>
      </div>
      <div>
        <label>
          {strings().form.event.deposit}*
          <Input valueLink={ depositLink } type='number' />
          <div className='error-placeholder'>{ depositLink.error || '' }</div>
        </label>
      </div>
      <div>
        <button type='submit' disabled={nameLink.error || depositLink.error}>{ strings().form.event.submit }</button>
      </div>
    </form>;
  }
}

export default EventForm;