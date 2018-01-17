import React, { Component } from 'react'
import QRCode from 'qrcode'
import BaseModal from '../../components/modal/BaseModal'

class ModalDeposit extends Component {

  constructor(props) {
    super(props)
    this.state = {
      addressQRCode: null
    };
  }

  componentDidMount() {
    QRCode.toDataURL('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')
      .then(url => {
        this.setState({
          addressQRCode: url
        })
        console.log(url)
      })
      .catch(err => {
        console.error(err)
      })
  }


  render() {

    return(
      <BaseModal handleHideModal={this.props.handleHideModal}>
        <p>How to deposit? Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse aliquam erat lacus, in vulputate lorem venenatis ac. Mauris euismod, tortor vel cursus faucibus, lorem felis porttitor neque, non convallis lectus libero euismod nulla. Cras in nisi vitae nisi fermentum eleifend et et quam. Aliquam mollis sem commodo, auctor ante ut, vulputate quam. Praesent facilisis libero molestie elit laoreet tempus. Nam massa tortor, viverra vitae erat ut, tempor gravida odio. Nunc vestibulum egestas ultrices. Vestibulum faucibus hendrerit nibh sed porta. Suspendisse id elementum lectus, vel gravida arcu.</p>
        <p>Address: 1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2</p>
        <p><img src={this.state.addressQRCode} alt="" /></p>
      </BaseModal>
    )
  }
}

export default ModalDeposit
