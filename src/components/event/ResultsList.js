import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';
import ModalNewBet from './ModalNewBet';
import { newBet } from '../../actions/pages/event';

class ResultsList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      results: []
    }
  }

  componentWillMount() {
    this.fetchResults();
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

  render() {
    return <Fragment><table className="table table-striped results"><tbody>
      {this.state.results.map((result, key) => {
        return <tr key={key}>
          <td>{result[0]}</td>
          <td>{result[1].toString()}</td>
          <td>
            <span className="btn btn-primary" onClick={() => this.props.newBet(key)}>{this.props.translate('pages.event.newBet')}</span>
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
    showNewBetModal: state.event.showNewBetModal,
    translate: getTranslate(state.locale)
  }
}

const mapDispatchToProps = {
  newBet
};

export default connect(mapStateToProps, mapDispatchToProps)(ResultsList);