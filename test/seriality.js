import expectThrow from './helpers/expectThrow';
import {toBytesTruffle as toBytes} from '../src/util/serialityUtil';

var SerialityTest = artifacts.require("./test/SerialityTest.sol");

contract('SerialityUtil', function(accounts) {

  let serialityTest;
  let arr, result, n;

  it("should serialize data the same way that smart-contract do", async () => {

    serialityTest = await SerialityTest.deployed();

    arr = toBytes(
      {type: 'int', size: 8, value: 87},
      {type: 'uint', size: 24, value: 76545},
      {type: 'string', value: 'Bia inja dahan service'},
      {type: 'string', value: 'Copy kon lashi'},
      {type: 'int', size: 256, value: 34444445},
      200
    );

    result = await serialityTest.testSample1Serializing({from: accounts[0], gas: 6721975});

    n = result.logs[0].args;

    assert.equal(arr, n.buffer);

  });

  it("should correctly serialize numbers and strings for SerialityTest.testSample1", async () => {

    serialityTest = await SerialityTest.deployed();

    arr = toBytes(
      {type: 'int', size: 8, value: 87},
      {type: 'uint', size: 24, value: 76545},
      {type: 'string', value: 'Bia inja dahan service'},
      {type: 'string', value: 'Copy kon lashi'},
      {type: 'int', size: 256, value: 34444445},
      200
    );

    result = await serialityTest.testSample1(arr, {from: accounts[0], gas: 6721975});

    n = result.logs[0].args;

    assert.equal(34444445, n.n1.toNumber());
    assert.equal(87, n.n2.toNumber());
    assert.equal(76545, n.n3.toNumber());
    assert.equal("Copy kon lashi", n.n4);
    assert.equal("Bia inja dahan service", n.n5);

  });

  it("should fail if bytes not match what smart-contract expects", async () => {

    serialityTest = await SerialityTest.deployed();

    arr = toBytes(
      {type: 'int', size: 8, value: 87},
      {type: 'uint', size: 24, value: 76545},
      {type: 'uint', size: 24, value: 76545},
    );

    await expectThrow(serialityTest.testSample1(arr, {from: accounts[0], gas: 6721975}));

  });

  it("should correctly serialize positive and negative int, uint of different sizes for SerialityTest.testSample2", async () => {

    serialityTest = await SerialityTest.deployed();

    arr = toBytes(
      {type: 'int', size: 8, value: -12},
      {type: 'int', size: 24, value: 838860},
      {type: 'uint', size: 32, value: 85},
      {type: 'int', size: 128, value: -44444444444},
      {type: 'address', value: "0x15b7926835a7c2fd6d297e3adecc5b45f7309f59"},
      {type: 'address', value: "0x1cb5cf010e407afc6249627bfd769d82d8dbbf71"}
    );

    result  = await serialityTest.testSample2(arr, {from: accounts[0]});

    n = result.logs[0].args;

    assert.equal(-12, n.n1.toNumber());
    assert.equal(838860, n.n2.toNumber());
    assert.equal(85, n.n3.toNumber());
    assert.equal(-44444444444, n.n4.toNumber());
    assert.equal("0x15b7926835a7c2fd6d297e3adecc5b45f7309f59", n.n5);
    assert.equal("0x1cb5cf010e407afc6249627bfd769d82d8dbbf71", n.n6);

  });

  it("should correctly serialize address for SerialityTest.testSample3", async () => {

    serialityTest = await SerialityTest.deployed();

    const address = "0x1cb5cf010e407afc6249627bfd769d82d8dbbf71";

    arr = toBytes(
      {type: 'address', value: address}
    );

    result = await serialityTest.testSample3(arr, {from: accounts[0]});

    n = result.logs[0].args;

    assert.equal(address, n.n1);

  });
});
