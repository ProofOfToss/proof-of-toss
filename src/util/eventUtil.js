import compressjs from 'compressjs';
import {toBytesTruffle as toBytes, fromBytes, toBytesBuffer, bytesToByteStringsArray} from './serialityUtil';

export const STATUS_CREATED = 0;
export const STATUS_PUBLISHED = 1;
export const STATUS_ACCEPTED = 2;

function serializeEvent(eventData) {
  let toBytesArgs = [
    {type: 'string', size: 2, value: eventData.locale}, // locale
    {type: 'string', size: 32, value: eventData.bidType}, // bidType
    {type: 'string', size: 32, value: eventData.category}, // category
    {type: 'string', value: eventData.name}, // name
    {type: 'string', value: eventData.description}, // description
    {type: 'string', value: eventData.sourceUrl}, // sourceUrl
  ];

  eventData.results.forEach((result) => {
    toBytesArgs.push({type: 'string', value: result.description});
  });

  eventData.tags.forEach((tag) => {
    toBytesArgs.push({type: 'string', value: tag});
  });

  let eventInfo = toBytesBuffer.apply(this, toBytesArgs);

  const algorithm = compressjs.BWTC;
  const data = new Buffer(eventInfo, 'utf8');
  const compressed = algorithm.compressFile(data);

  toBytesArgs = [
    {type: 'uint', size: 64, value: eventData.startDate}, // startDate
    {type: 'uint', size: 64, value: eventData.endDate}, // endDate
    {type: 'uint', size: 8, value: eventData.results.length}, // resultsCount
    {type: 'uint', size: 8, value: eventData.tags.length}, // tagsCount
  ];

  eventData.results.forEach((result) => {
    toBytesArgs.push({type: 'uint', size: 64, value: result.coefficient});
  });

  toBytesArgs.push({type: 'bytes', value: compressed});

  return toBytes.apply(this, toBytesArgs);
}

function deserializeEvent(bytes) {
  bytes = bytesToByteStringsArray(bytes).join('');

  let parsed = fromBytes(
    bytes,
    {type: 'uint', size: 64, key: 'startDate'},
    {type: 'uint', size: 64, key: 'endDate'},
    {type: 'uint', size: 8, key: 'resultsCount'},
    {type: 'uint', size: 8, key: 'tagsCount'},
  );
  let offset = parsed.offset, parsedData = parsed.parsedData;
  parsedData.results = [];
  parsedData.tags = [];

  for(let i = 0; i < parsedData.resultsCount; i++) {
    parsed = fromBytes(
      bytes,
      offset,
      {type: 'uint', size: 64, key: `coefficient`},
    );

    offset = parsed.offset;
    parsedData.results.push({coefficient: parsed.parsedData.coefficient});
  }

  let compressedData = bytes.substr(0, offset);
  let compressedBuffer = toBytesBuffer({type: 'bytes', value: compressedData});
  const algorithm = compressjs.BWTC;
  const decompressed = algorithm.decompressFile(compressedBuffer);

  bytes = bytesToByteStringsArray(decompressed).join('');

  parsed = fromBytes(
    bytes,
    {type: 'string', size: 2, key: 'locale'},
    {type: 'string', size: 32, key: 'bidType'},
    {type: 'string', size: 32, key: 'category'},
    {type: 'string', key: 'name'},
    {type: 'string', key: 'description'},
    {type: 'string', key: 'sourceUrl'},
  );

  offset = parsed.offset;
  Object.assign(parsedData, parsed.parsedData);

  for(let i = 0; i < parsedData.resultsCount; i++) {
    parsed = fromBytes(
      bytes,
      offset,
      {type: 'string', key: `description`},
    );

    offset = parsed.offset;
    parsedData.results[i].description = parsed.parsedData.description;
  }

  for(let i = 0; i < parsedData.tagsCount; i++) {
    parsed = fromBytes(
      bytes,
      offset,
      {type: 'string', key: `tag`},
    );

    offset = parsed.offset;
    parsedData.tags.push(parsed.parsedData.tag);
  }

  return parsedData;
}

export {serializeEvent, deserializeEvent};