import React from 'react'
import { shallow } from 'enzyme'
import configureStore from 'redux-mock-store'
import initLocale  from '../../components/locale/init'
import { Event } from './EventTest'

describe('event page', () => {
  it('renders without crashing', () => {
    const mockStore = configureStore()

    const store = mockStore()

    initLocale(store.dispatch, 'en')

    const wrapper = shallow(<Event store={store} />)

    const showErrors = wrapper.state().showErrors
    expect(showErrors).toEqual(false)
  })
})
