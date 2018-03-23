import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import Link from 'valuelink'
import BootstrapInput from '../../components/form/BootstrapInput'
import ModalNewBet from './ModalNewBet';
import { fetchAllowance, approve, newBet } from '../../actions/pages/event';

class ResultsList extends Component {
  constructor(props) {
    super(props);

    this.handleApprove = this.handleApprove.bind(this);

    this.state = {
      results: [],
      betAmount_0: 0,
      betAmount_1: 0,
      betAmount_2: 0,
      showErrors: false,
      errors: {},
      allowance: 0
    }
  }

  async componentWillMount() {
    this.fetchResults();
    this.props.fetchAllowance();
  }

  fetchResults() {
    let promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(this.props.eventInstance.possibleResults(i));
    }

    Promise.all(promises).then((results) => {
      const filterResults = results.filter((result) => {
        if (result[0] === '') {
          return false;
        }

        return true;
      });

      this.setState({
        results: filterResults
      });
    });
  }

  newBet(resultIndex) {
    const valueLinkKey = `betAmount_${resultIndex}`;
    const valueLink = this.links[valueLinkKey];

    if(valueLink.error) {
      let errors = {...this.state.errors};
      errors[valueLinkKey] = true;

      this.setState({
        showErrors: true,
        errors: errors
      })
    } else {
      let result = this.state.results[resultIndex];
      this.props.newBet(result, resultIndex, valueLink.value)
    }
  }

  handleApprove(resultIndex) {
    this.props.approve(this.links[`betAmount_${resultIndex}`].value);
  }

  render() {
    //Create valueLinks for new bet field
    this.state.results.forEach((result, key) => {
      Link.state(this, `betAmount_${key}`)
        .check(v => v, this.props.translate('validation.required'))
        .check(v => !isNaN(parseFloat(v)), this.props.translate('validation.token.fee_is_nan'))
        .check(v => parseFloat(v) >= 1, this.props.translate('validation.to_small', {value: 1}))
      ;
    });

    return <Fragment>
      <div className='alert alert-info' role='alert'>
        {this.props.translate('pages.event.allowance_balance', {
          allowance: this.props.allowance})
        }
      </div>

      <table className="table table-striped results"><tbody>
        <tr>
          <th>{this.props.translate('pages.event.result.name')}</th>
          <th>{this.props.translate('pages.event.result.coefficient')}</th>
          <th />
        </tr>
      {this.state.results.map((result, key) => {

        const betAmountLink = this.links[`betAmount_${key}`];

        let button = <span className="btn btn-warning" onClick={() => this.handleApprove(key)}>
          {this.props.translate('pages.event.approve')}</span>;

        if(this.props.allowance >= betAmountLink.value) {
          button = <span className="btn btn-primary" onClick={() => this.newBet(key)}>
            {this.props.translate('pages.event.newBet')}</span>
        }

        const inputAttr = {
          type: 'number',
          id: `event[bet_amount_${key}]`,
          placeholder: this.props.translate('pages.event.bet_amount'),
          min: 0
        };

        return <tr key={key}>
          <td>{result[0]}</td>
          <td>{result[1].toString()}</td>
          <td>
            <form className="form-inline">
              <BootstrapInput valueLink={betAmountLink} showError={this.state.errors[`betAmount_${key}`]} attr={inputAttr} />
              {button}
            </form>
          </td>
        </tr>
      }, this)}
    </tbody></table>
    {this.props.showNewBetModal ? <ModalNewBet eventInstance={this.props.eventInstance} /> : null}
  </Fragment>
    ;
  }
}

function mapStateToProps(state) {
  return {
    web3: state.web3.web3,
    allowance: state.event.allowance,
    showNewBetModal: state.event.showNewBetModal,
    translate: getTranslate(state.locale)
  }
}

const mapDispatchToProps = {
  fetchAllowance,
  approve,
  newBet
};

export default connect(mapStateToProps, mapDispatchToProps)(ResultsList);