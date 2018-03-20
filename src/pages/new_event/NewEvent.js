import 'babel-polyfill';
import React, { Component } from 'react'
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import EventForm from '../../components/new_event/EventForm';
import config from "../../data/config.json";

import { deployed } from '../../util/contracts';

class NewEvent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      eventAddress: null,
      hasAccess: config.whitelist.indexOf(this.props.currentAddress) >= 0,
      whiteListSynced: true,
    }

    this.checkAccess = this.checkAccess.bind(this);
  }

  componentWillMount() {
    this.checkAccess();
  }

  componentWillUpdate(nextProps) {
    if (this.props.currentAddress !== nextProps.currentAddress) {
      this.checkAccess();
    }
  }

  async checkAccess() {
    if (config.whitelist.indexOf(this.props.currentAddress) >= 0) {
      try {
        const mainInstance = (await deployed(this.props.web3, 'main')).mainInstance;
        const inWhitelist = await mainInstance.whitelist(this.props.currentAddress);

        this.setState({
          hasAccess: inWhitelist,
          whiteListSynced: inWhitelist,
        });
      } catch (e) {
        this.setState({hasAccess: false});
      }
    } else {
      this.setState({hasAccess: false});
    }
  }

  render() {
    return (
      <main className="container">
        <div>
          {
            this.state.eventAddress === null && <div className="pure-u-1-1">
              <h1>New event</h1>
              {
                this.state.hasAccess
                  ? <EventForm ref={ev => this.event = ev} />
                  : <div>
                      <p>{this.props.translate('pages.new_event.access_denied')}</p>
                      {
                        this.state.whiteListSynced ? null : <p>{ this.props.translate('pages.new_event.sync_whitelist') }</p>
                      }
                  </div>
              }
            </div>
          }
          {
            this.state.eventAddress !== null && this.state.eventAddress
          }
        </div>
      </main>
    );
  }
}

function mapPropsToState(state) {
  return {
    web3: state.web3.web3,
    currentAddress: state.user.address,
    translate: getTranslate(state.locale),
  };
}

export default connect(mapPropsToState)(NewEvent)

