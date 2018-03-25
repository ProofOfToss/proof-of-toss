import {serializeEvent, deserializeEvent} from '../src/util/eventUtil';

describe('EventUtil', function() {

  it("should serialize and deserialize english event", async () => {

    const eventName = 'Test event';
    const eventDescription = 'description';

    const bidType = 'bid_type';
    const eventCategory = 'category_id';
    const eventLocale = 'en';
    const eventStartDate = 1517406195;
    const eventEndDate = 1580478195;

    const eventSourceUrl = 'source_url';
    const eventTags = ['tag1_name', 'tag2_name', 'tag3_name'];
    const eventResults = [{description: 'result_description_1', coefficient: 10}, {description: 'result_description_2', coefficient: 20}];

    const bytes = serializeEvent({
      name: eventName,
      description: eventDescription,
      bidType: bidType,
      category: eventCategory,
      locale: eventLocale,
      startDate: eventStartDate,
      endDate: eventEndDate,
      sourceUrl: eventSourceUrl,
      tags: eventTags,
      results: eventResults,
    });

    const eventData = deserializeEvent(bytes);

    assert.equal(eventName, eventData.name);
    assert.equal(eventDescription, eventData.description);
    assert.equal(bidType, eventData.bidType);
    assert.equal(eventCategory, eventData.category);
    assert.equal(eventLocale, eventData.locale);
    assert.equal(eventStartDate, eventData.startDate);
    assert.equal(eventEndDate, eventData.endDate);
    assert.equal(eventSourceUrl, eventData.sourceUrl);

    assert.equal(eventTags[0], eventData.tags[0]);
    assert.equal(eventTags[1], eventData.tags[1]);
    assert.equal(eventTags[2], eventData.tags[2]);

    assert.equal(eventResults[0].description, eventData.results[0].description);
    assert.equal(eventResults[1].description, eventData.results[1].description);

    assert.equal(eventResults[0].coefficient, eventData.results[0].coefficient);
    assert.equal(eventResults[1].coefficient, eventData.results[1].coefficient);

  });

  it("should serialize and deserialize russian event", async () => {

    const eventName = 'Тестовое событие';
    const eventDescription = 'Описание';

    const bidType = 'Тип ставки';
    const eventCategory = 'категория';
    const eventLocale = 'ru';
    const eventStartDate = 1517406195;
    const eventEndDate = 1580478195;

    const eventSourceUrl = 'https://пример.рф/';
    const eventTags = ['тэг 1', 'тэг 2', 'тэг 3'];
    const eventResults = [{description: 'результат 1', coefficient: 10}, {description: 'результат 2', coefficient: 20}];

    const bytes = serializeEvent({
      name: eventName,
      description: eventDescription,
      bidType: bidType,
      category: eventCategory,
      locale: eventLocale,
      startDate: eventStartDate,
      endDate: eventEndDate,
      sourceUrl: eventSourceUrl,
      tags: eventTags,
      results: eventResults,
    });

    const eventData = deserializeEvent(bytes);

    assert.equal(eventName, eventData.name);
    assert.equal(eventDescription, eventData.description);
    assert.equal(bidType, eventData.bidType);
    assert.equal(eventCategory, eventData.category);
    assert.equal(eventLocale, eventData.locale);
    assert.equal(eventStartDate, eventData.startDate);
    assert.equal(eventEndDate, eventData.endDate);
    assert.equal(eventSourceUrl, eventData.sourceUrl);

    assert.equal(eventTags[0], eventData.tags[0]);
    assert.equal(eventTags[1], eventData.tags[1]);
    assert.equal(eventTags[2], eventData.tags[2]);

    assert.equal(eventResults[0].description, eventData.results[0].description);
    assert.equal(eventResults[1].description, eventData.results[1].description);

    assert.equal(eventResults[0].coefficient, eventData.results[0].coefficient);
    assert.equal(eventResults[1].coefficient, eventData.results[1].coefficient);

  });

});
