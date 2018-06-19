import { getLanguageAnalyzerByCode } from './i18n';
import { RESULT_DID_NOT_HAPPEN } from '../classes/event';

function filterEventsConditions(locale, q, fromTimestamp, toTimestamp) {
  const conditions = [];
  const shouldConditions = [];

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

  if ((fromTimestamp || toTimestamp)) {
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

  conditions.push({
    range: {
      'bidSum': {gt: 0},
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

function myPrizeBetConditions(currentAddress, eventHits) {
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

  conditions.push({
    term: {
      'bettor': currentAddress,
    }
  });

  conditions.push({ // bet on winning result
    'script' : {
      'script' : {
        'source': `for (item in params.events) { if(doc["event"].value == item.address) { return (Long.parseLong(item.result, 10) == doc["result"].value || Long.parseLong(item.result, 10) == ${RESULT_DID_NOT_HAPPEN}) } } return false`,
        'lang': 'painless',
        'params' : {
          'events': eventHits.map((hit) => ({address: hit._id, result: hit._source.result})),
        }
      }
    }
  });

  return {conditions};
}

function bidInfo (bid, event) {
  const eventFinished = event.result < 255;
  const hasDefinedResult = event.result < 232;
  const isOperatorEvent = false;
  const bidResult = event.possibleResults[bid.result];
  let coefficient, prize;

  if (eventFinished && !hasDefinedResult) {
    coefficient = '-';
    prize = bid.amount;
  } else {
    if (isOperatorEvent) {
      coefficient = parseFloat(bidResult.customCoefficient);
      prize = event.result === bid.result ? parseFloat(bid.amount) * coefficient : 0;
    } else {
      let losersBetSum = 0;
      let winnersBetSum = 0;
      let winningResult, possibleResult, eventResult = parseInt(event.result, 10);

      for (let i = 0; i < event.possibleResults.length; i++) {
        possibleResult = parseInt(event.possibleResults[i].index, 10);
        winningResult = hasDefinedResult ? eventResult : possibleResult;

        if (possibleResult === winningResult) {
          winnersBetSum += parseFloat(event.possibleResults[i].betSum);
        } else {
          losersBetSum += parseFloat(event.possibleResults[i].betSum);
        }
      }

      coefficient = winnersBetSum > 0 ? parseFloat(bid.amount) / winnersBetSum : 0;

      if (bid.result === event.result) {
        prize = parseFloat(bid.amount) * 0.99 + losersBetSum * 0.99 * coefficient;
      } else {
        prize = 0;
      }
    }
  }

  return {
    tx: bid.tx,
    isWinningBet: event.result === bid.result,
    bidResult: bidResult.description,
    bidSum: bid.amount,
    bidDate: bid.timestamp,
    coefficient: coefficient,
    prize: prize,
    index: bid.index,
    userIndex: bid.userIndex,
    hasDefinedResult: hasDefinedResult,
  };
}

export {myBetsConditions, myPrizeConditions, myPrizeBetConditions, myRewardConditions, bidInfo};
