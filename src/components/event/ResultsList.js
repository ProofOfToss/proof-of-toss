import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getTranslate } from 'react-localize-redux';

class ResultsList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      results: []
    }
  }

  componentWillMount() {
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

  addBet() {
    console.log('Add bet...');
  }

  render() {
    return <table className="table table-striped results"><tbody>
      {this.state.results.map((result, key) => {
        return <tr key={key}>
          <td>{result[0]}</td>
          <td>{result[1].toString()}</td>
          <td>
            <span className="btn btn-primary" onClick={this.addBet}>{this.props.translate('pages.event.newBet')}</span>
          </td>
        </tr>
      }, this)}
    </tbody></table>
    ;
  }
}

function mapStateToProps(state) {
  return {
    translate: getTranslate(state.locale)
  }
}

export default connect(mapStateToProps)(ResultsList);