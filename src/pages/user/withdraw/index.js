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

          <h2>My bets</h2>

          <PlayerWithdraw {...this.props}/>

          <h2>My events</h2>

          <EventCreatorWithdraw {...this.props}/>

        </div>
        {this.props.showWithdrawModal ? <ModalWithdraw /> : null}
      </main>
    )
  }
}


function mapStateToProps(state) {
  return {
    currentAddress: state.user.address,
    translate: getTranslate(state.locale),
    locale: _.find(state.locale.languages, (l) => l.active).code,
    esClient: state.elastic.client,
    showWithdrawModal: state.event.showWithdrawModal
  };
}

const mapDispatchToProps = {
  modalWithdrawShow
};

export default connect(mapStateToProps, mapDispatchToProps)(Withdraw);
