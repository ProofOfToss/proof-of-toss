import {BigNumber} from 'bignumber.js';

BigNumber.config({ EXPONENTIAL_AT: 30 });

// add methods for web3.BigNumber (<6.0.0) back compatibility

// Remove toDigits method; extend precision method accordingly.
BigNumber.prototype.toDigits = BigNumber.prototype.precision;

// Remove round method; extend decimalPlaces method accordingly.
BigNumber.prototype.round = function ( dp, rm ) {
  return this.decimalPlaces(dp || ~~dp, rm || BigNumber.HALF_UP);
};

// Remove methods: ceil, floor, and truncated.
BigNumber.prototype.ceil = function () { return this.integerValue(BigNumber.ROUND_CEIL);};
BigNumber.prototype.floor = function () { return this.integerValue(BigNumber.ROUND_FLOOR);};
BigNumber.prototype.truncated = function () { return this.integerValue(BigNumber.ROUND_DOWN);};

// Remove method aliases: add, cmp, isInt, isNeg, trunc, mul, neg and sub.
BigNumber.prototype.add = BigNumber.prototype.plus;
BigNumber.prototype.cmp = BigNumber.prototype.comparedTo;
BigNumber.prototype.isInt = BigNumber.prototype.isInteger;
BigNumber.prototype.isNeg = BigNumber.prototype.isNegative;
BigNumber.prototype.trunc = BigNumber.prototype.truncated;
BigNumber.prototype.mul = BigNumber.prototype.times;
BigNumber.prototype.neg = BigNumber.prototype.negated;
BigNumber.prototype.sub = BigNumber.prototype.minus;

// Rename methods: shift to shiftedBy, another to clone, toPower to exponentiatedBy, and equals to isEqualTo.
BigNumber.prototype.shift = BigNumber.prototype.shiftedBy;
BigNumber.prototype.another = BigNumber.prototype.clone;
BigNumber.prototype.toPower = BigNumber.prototype.exponentiatedBy;
BigNumber.prototype.equals = BigNumber.prototype.isEqualTo;

// Rename methods: add is prefix to greaterThan, greaterThanOrEqualTo, lessThan and lessThanOrEqualTo.
BigNumber.prototype.greaterThan = BigNumber.prototype.isGreaterThan;
BigNumber.prototype.greaterThanOrEqualTo = BigNumber.prototype.isGreaterThanOrEqualTo;
BigNumber.prototype.lessThan = BigNumber.prototype.isLessThan;
BigNumber.prototype.lessThanOrEqualTo = BigNumber.prototype.isLessThanOrEqualTo;

export default BigNumber;
