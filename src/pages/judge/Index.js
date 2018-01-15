import React, { Component } from 'react'
import ModalConfirmResult from './ModalConfirmResult'

class Judge extends Component {
  constructor(props) {
    super(props);
    this.state = {view: {showModal: false}}
    this.handleHideModal = this.handleHideModal.bind(this)
    this.handleShowModal = this.handleShowModal.bind(this)
  }

  handleHideModal() {
    this.setState({view: {showModal: false}})
  }

  handleShowModal() {
    this.setState({view: {showModal: true}})
  }

  render() {
    return(
      <main className="container">
        <div>
          <h1>Judge page</h1>
          <div className="btn btn-primary" onClick={this.handleShowModal}>Confirm result</div>
          {this.state.view.showModal ? <ModalConfirmResult handleHideModal={this.handleHideModal}/> : null}
        </div>
      </main>
    )
  }
}

export default Judge
