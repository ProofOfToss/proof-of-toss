import appConfig from '../../src/data/config.json';
import { getLanguageAnalyzerByCode } from './i18n';
import _ from "lodash";

const TAG_INDEX = 'toss_tag_' + appConfig.elasticsearch.indexPostfix;

async function fetchTags(esClient, q, locale) {

  q = q.replace('_', '\_');

  const res = await esClient.search({
    index: TAG_INDEX,
    type: 'tag',
    body: {
      query: {
        match_phrase_prefix: {
          name: {
            query: q,
            analyzer: getLanguageAnalyzerByCode(locale)
          }
        }
      }
    }
  });

  return _.map(res.hits.hits, '_source');
}

export {fetchTags};