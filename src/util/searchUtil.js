import Datetime from "react-datetime";
import { getLanguageAnalyzerByCode } from './i18n';

function myBetsConditions(locale, currentAddress, q, fromTimestamp, toTimestamp) {
  const conditions = [];
  const shouldConditions = [];

  conditions.push({
    term: {
      locale: locale
    }
  });

  conditions.push({
    term: {
      'bettor': currentAddress,
    }
  });

  if (q) {
    shouldConditions.push({
      query_string: {
        analyzer: getLanguageAnalyzerByCode(locale),
        fields: ['name', 'description'],
        query: q
      }
    });

    shouldConditions.push({
      "nested": {
        "path": "tag",
        "query": {
          query_string: {
            analyzer: getLanguageAnalyzerByCode(locale),
            fields: ['tag.name'],
            query: q
          }
        }
      }
    });

  }

  if (fromTimestamp || toTimestamp) {
    const condition = {};

    if (fromTimestamp) { condition.gte = fromTimestamp; }
    if (toTimestamp) { condition.lte = toTimestamp; }

    conditions.push({
      range: {
        startDate: condition
      }
    });
  }

  return {conditions, shouldConditions};
}

function myPrizeConditions(locale, currentAddress, q, fromTimestamp, toTimestamp) {
  const {conditions, shouldConditions} = myBetsConditions(locale, currentAddress, q, fromTimestamp, toTimestamp);


  conditions.push({ // Event has result
    range: {
      result: {
        lt: 255,
      }
    }
  });

  return {conditions, shouldConditions};
}

function myPrizeBetConditions() {
  const conditions = {};

  conditions.push({ // bet not withdrawn
    term: {
      'withdrawn': false,
    }
  });

  conditions.push({ // bet on winning result
    term: {
      'script' : {
        'script' : {
          'source': 'doc["eventResult"].value == doc["result"].value || (doc["eventResult"].value >= 232 && doc["eventResult"].value < 255)',
          'lang': 'painless'
        }
      }
    }
  });

  return {conditions};
}

export {myBetsConditions, myPrizeConditions, myPrizeBetConditions};