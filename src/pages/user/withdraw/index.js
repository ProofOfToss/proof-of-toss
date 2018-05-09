import 'babel-polyfill';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import _ from "lodash";
import { modalWithdrawShow } from '../../../actions/pages/event';
import EventCreatorWithdraw from './EventCreatorWithdraw';
import PlayerWithdraw from './PlayerWithdraw';
import ModalWithdraw from './ModalWithdraw';
import '../../../styles/components/play_table.scss';

class Withdraw extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <main className="container">
        <div>
          <h1>{ this.props.translate('pages.withdraw.header') }</h1>

          <h2>{ this.props.translate('pages.withdraw.my_bets') }</h2>

          <PlayerWithdraw location={this.props.location} />

          <h2>{ this.props.translate('pages.withdraw.my_events') }</h2>

          <EventCreatorWithdraw location={this.props.location} />

        </div>
        {this.props.showWithdrawModal ? <ModalWithdraw /> : null}
      </main>
    )
  }
}


function mapStateToProps(state) {
  return {
    translate: getTranslate(state.locale),
    showWithdrawModal: state.event.showWithdrawModal
  };
}

const mapDispatchToProps = {
  modalWithdrawShow
};

export default connect(mapStateToProps, mapDispatchToProps)(Withdraw);
