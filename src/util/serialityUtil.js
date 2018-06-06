import BigNumber from './bignumber';

/**
 * Converts serialized bytes from any format to strings-array format
 *
 * @param value
 * @returns {Array}
 */
function bytesToByteStringsArray(value) {
  if (Array.isArray(value)) {

    return value;
  } else if (typeof value === 'string') {

    if (value.length >= 2 && value.substr(0, 2) === '0x') {
      value = value.substr(2);
    }

    const bytes = [], length = value.length;

    for (let i = 0; i < length; i += 2) {
      bytes.push(`${value[i] + value[i + 1]}`);
    }

    return bytes;
  } else if (Uint8Array.prototype.isPrototypeOf(value)) {

    const bytes = [], length = value.length;
    let char;

    for (let i = 0; i < length; i++) {
      char = value[i].toString(16);
      bytes.push(`${char.length === 1 ? '0' : ''}${char}`);
    }

    return bytes;
  } else {

    throw new Error('invalid value');
  }
};

/**
 * Example: let arr = toBytes({type: 'int', size: 8, value: -12}, {type: 'int', size: 24, value: 838860}, {type: 'uint', size: 32, value: 85}, {type: 'int', size: 128, value: -44444444444}, {type: 'address', value: "0x15b7926835a7c2fd6d297e3adecc5b45f7309f59"}, {type: 'address', value: "0x1cb5cf010e407afc6249627bfd769d82d8dbbf71"});
 *
 * @returns {Array}
 */
function toByteStringsArray() {
  const _checkValue = (value) => {
    if (
      typeof value !== 'object'
      || typeof value.type !== 'string'
      || (
        (value.type === 'int' || value.type === 'uint')
        && typeof value.size !== 'number'
        && value.size <= 0
      )
      || typeof value.value === 'undefined'
    ) {
      throw new Error('invalid value');
    }
  };

  const _intToBytes = (value, sizeBits) => {
    const size = sizeBits / 8;
    const n = BigNumber(value, 10);
    let unsignedValue = n;

    if (value < 0) {
      const maxNum = BigNumber('0x' + 'f'.repeat(8 * Math.ceil(Math.log2(-n.toNumber()) / 8)), 16);
      unsignedValue = maxNum.plus(n).plus(1);
    }

    let str = unsignedValue.toString(16);

    if (str.length >= size * 2) {
      str = `${str.substr(str.length - size * 2)}`;
    } else {
      str = `${'0'.repeat(size * 2 - str.length)}${str}`;
    }

    const bytes = [], length = str.length;

    for (let i = 0; i < length; i += 2) {
      bytes.push(`${str[i] + str[i + 1]}`);
    }

    return bytes;
  };

  const _addressToBytes = (value) => {
    const bytes = [], length = value.length;

    for (let i = 2; i < length; i += 2) {
      bytes.push(`${value[i] + value[i + 1]}`);
    }

    return bytes;
  };

  const _stringToBytes = (value, size) => {
    const bytes = [], fixedSize = typeof size === 'number';
    let char;

    const buffer = new Buffer(value.toString(), 'utf-8');
    const length = buffer.length;

    if (!fixedSize) {
      size = Math.ceil(length / 32) * 32;
    }

    for (let i = 0; i < length; i++) {
      char = buffer[i].toString(16);
      bytes.push(`${char.length === 1 ? '0' : ''}${char}`);
    }

    for (let i = bytes.length; i < size; i++) {
      bytes.push('00');
    }

    if (!fixedSize) {
      return bytes.concat(_intToBytes(length, 256));
    }

    return bytes;
  };

  const _toBytes = (value) => {
    _checkValue(value);

    switch (value.type) {
      case 'int': case 'uint':
        return _intToBytes(value.value, value.size);
      case 'string':
        return _stringToBytes(value.value, value.size);
      case 'address':
        return _addressToBytes(value.value);
      case 'bytes':
        return bytesToByteStringsArray(value.value);
      default:
        throw new Error('invalid type');
    }
  };

  if (arguments.length === 0) {
    throw new Error('No values');
  }

  const bytes = [];
  const lastArgument = arguments[arguments.length - 1];
  const fixedSize = typeof lastArgument === 'number';
  const values = arguments;

  for (let i = values.length - (fixedSize ? 2 : 1); i >= 0; i--) {
    const _bytes = _toBytes(values[i]), length = _bytes.length;

    for (let j = 0; j < length; j++) {
      bytes.push(_bytes[j]);
    }
  }

  if (typeof lastArgument === 'number') {
    const offset = lastArgument - bytes.length;

    for (let j = 0; j < offset; j++) {
      bytes.unshift('00');
    }
  }

  return bytes;
}

/**
 * First argument: bytes to parse
 * Second argument (optional): bytes offset
 * Next arguments – objects in format: {type: 'uint', size: 64, key: 'deposit'}, {type: 'string', key: 'name'}
 * Result format: {offset: 128, parsedData: {deposit: 10, name: 'test name'}}
 *
 * @returns {Object}
 */
function fromBytes() {
  if (arguments.length < 2) {
    throw new Error('invalid arguments');
  }

  const bytes = bytesToByteStringsArray(arguments[0]).join('');
  const result = {};
  let offset = typeof arguments[1] === 'number' ? arguments[1] : bytes.length;

  const _checkValue = (value) => {
    if (
      typeof value !== 'object'
      || typeof value.type !== 'string'
      || typeof value.key !== 'string'
      || (
        (value.type === 'int' || value.type === 'uint')
        && typeof value.size !== 'number'
        && value.size <= 0
      )
    ) {
      throw new Error('invalid value');
    }
  };

  const _nextChunk = (value) => {
    _checkValue(value);

    let size;

    switch (value.type) {
      case 'int': case 'uint':
        size = value.size / 8;
        break;
      case 'string':
        if (typeof value.size === 'number') {
          size = value.size;
        } else {
          offset -= 32 * 2;
          size = parseInt(bytes.substr(offset, 32 * 2), 16);

          size = Math.ceil(size / 32) * 32;
        }
        break;
      case 'address':
        size = 20;
        break;
      case 'bytes':
        // Must be the last element. Gets all remaining bytes
        size = offset / 2;
        break;
      default:
        throw new Error('invalid type');
    }

    offset -= size * 2;

    return bytes.substr(offset, size * 2);
  }

  const _parseChunk = (chunk, value) => {
    switch (value.type) {
      case 'int':
        const maxPositiveNumber = Math.pow(2, value.size / 2) - 1;
        let n = parseInt(chunk, 16);

        if (n > maxPositiveNumber) {
          n = - (2 * maxPositiveNumber - n + 1);
        }

        return n;
      case 'uint':
        return parseInt(chunk, 16);
      case 'string':
        let bytes = [];

        for (let i = 0; i < chunk.length; i += 2) {
          bytes.push(parseInt(chunk.substr(i, 2), 16));
        }

        return (new Buffer(bytes)).toString().replace(/\0/g, '');
      case 'address':
        return '0x' + chunk;
      case 'bytes':
        return chunk;
      default:
        throw new Error('invalid type');
    }
  }

  const values = arguments;

  for (let i = typeof arguments[1] === 'number' ? 2 : 1; i < values.length; i++) {
    result[values[i].key] = _parseChunk(_nextChunk(values[i]), values[i]);
  }

  return {
    offset: offset,
    parsedData: result,
  };
}

/**
 * Result format: ['0x1c', '0xb5', '0xcf', '0x01', '0x0e', ... ]
 *
 * @returns {Array}
 */
function toBytesWeb() {
  return toByteStringsArray.apply(this, arguments).map((s) => '0x' + s);
}

/**
 * Result format: '0x1cb5cf010e...'
 *
 * @returns {string}
 */
function toBytesTruffle() {
  return '0x' + toByteStringsArray.apply(this, arguments).join('');
}

/**
 * Result format: Uint8Array(28, 181, 207 ...)
 *
 * @returns {Uint8Array}
 */
function toBytesBuffer() {
  return new Uint8Array(toByteStringsArray.apply(this, arguments).map((s) => parseInt(s, 16)));
}

export {toBytesWeb, toBytesTruffle, toBytesBuffer, fromBytes, bytesToByteStringsArray};
