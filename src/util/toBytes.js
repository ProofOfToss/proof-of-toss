import {decToHex} from './hexToDec'
import {BigNumber} from 'bignumber.js';

const _bytesToBytes = (value) => {
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
        (value.type === 'int' || value.type === 'uint' || value.type === 'string')
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
    const bytes = [], length = value.length, fixedSize = typeof size === 'number';
    let char;

    if (!fixedSize) {
      size = Math.ceil(length / 32) * 32;
    }

    for (let i = 0; i < size; i++) {
      char = i < length ? value.charCodeAt(i).toString(16) : '0';

      if (char.length > 2) {
        char = char.length === 3 ? '0' + char : char;
        bytes.push(char.substr(0, 2));
        bytes.push(char.substr(2, 2));
      } else {
        bytes.push(`${char.length === 1 ? '0' : ''}${char}`);
      }
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
        return _bytesToBytes(value.value);
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

export {toBytesWeb, toBytesTruffle, toBytesBuffer, _bytesToBytes};
