import React, { Component } from 'react'

class Event extends Component {
  constructor(props) {
    super(props);
    this.state = { id: this.props.params.id };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ id: nextProps.params.id })
  }

  render() {
    return(
      <div />
    )
  }
}

export default Event
