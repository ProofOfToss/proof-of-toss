import Datetime from "react-datetime";
import { getLanguageAnalyzerByCode } from './i18n';

function filterEventsConditions(locale, q, fromTimestamp, toTimestamp) {
  const conditions = [];
  const shouldConditions = [];

  conditions.push({
    term: {
      locale: locale,
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

function myBetsConditions(locale, currentAddress, q, fromTimestamp, toTimestamp) {
  const {conditions, shouldConditions} = filterEventsConditions(locale, q, fromTimestamp, toTimestamp);

  conditions.push({
    term: {
      'bettor': currentAddress,
    }
  });

  return {conditions, shouldConditions};
}

function myRewardConditions(locale, currentAddress, q, fromTimestamp, toTimestamp) {
  const {conditions, shouldConditions} = filterEventsConditions(locale, q, fromTimestamp, toTimestamp);

  conditions.push({
    term: {
      'createdBy': currentAddress,
    }
  });

  conditions.push({
    term: {
      'withdrawn': false,
    }
  });

  conditions.push({ // Event has result
    range: {
      result: {
        lt: 255,
      }
    }
  });

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

function myPrizeBetConditions(eventHits) {
  const conditions = [];

  conditions.push({ // bet not withdrawn
    term: {
      'withdrawn': false,
    }
  });

  conditions.push({
    terms: {
      'event': eventHits.map((hit) => hit._id),
    }
  });

  conditions.push({ // bet on winning result
    'script' : {
      'script' : {
        'source': 'for (item in params.events) { if(doc["event"].value == item.address) { return Long.parseLong(item.result, 10) == doc["result"].value } } return false',
        'lang': 'painless',
        'params' : {
          'events': eventHits.map((hit) => ({address: hit._id, result: hit._source.result})),
        }
      }
    }
  });

  return {conditions};
}

export {myBetsConditions, myPrizeConditions, myPrizeBetConditions, myRewardConditions};