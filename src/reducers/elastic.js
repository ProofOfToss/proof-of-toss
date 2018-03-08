import { INIT_ELASTIC } from '../actions/elastic';
import appConfig from "../data/config.json"
import {AwsEsPublicClient} from '../util/esClient';

const initialState = {
  'client': new AwsEsPublicClient(
    { log: 'error' },
    appConfig.elasticsearch.esNode,
    appConfig.elasticsearch.region,
    appConfig.elasticsearch.useSSL
  ),
};

const elasticReducer = (state = initialState, action) => {
  switch (action.type) {
    case INIT_ELASTIC:
      return Object.assign({}, state, {
        'client': action.client,
      });

    default:
      return state;
  }
};

export default elasticReducer;
