import React from 'react'
import ReactDOM from 'react-dom'
import EventResults from './EventResults'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<EventResults />, div)
})
