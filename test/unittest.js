var assert = require('assert'),
    puts = require('util').puts,
    read = require('fs').readFileSync,
    Schema = require('../').Schema;

/* hack to make the tests pass with node v0.3.0's new Buffer model */
/* copied from http://github.com/bnoordhuis/node-iconv/blob/master/test.js */
assert.bufferEqual = function(a, b, c) {
	assert.equal(
		a.inspect().replace(/^<SlowBuffer/, '<Buffer'),
		b.inspect().replace(/^<SlowBuffer/, '<Buffer'),
                c);
};

var T = new Schema(read('test/unittest.desc'))['protobuf_unittest.TestAllTypes'];
assert.ok(T, 'type in schema');
var golden = read('test/golden_message');
var message = T.parse(golden);
assert.ok(message, 'parses message');  // currently rather crashes

assert.bufferEqual(T.serialize(message), golden, 'roundtrip');

message.ignored = 42;
assert.bufferEqual(T.serialize(message), golden, 'ignored field');

assert.throws(function() {
  T.parse(new Buffer('invalid'));
}, Error, 'Should not parse');

assert.strictEqual(T.parse(
  T.serialize({
    optional_int32: '3'
  })
).optional_int32, 3, 'Number conversion');

assert.strictEqual(T.parse(
  T.serialize({
    optional_int32: ''
  })
).optional_int32, 0, 'Number conversion');

assert.strictEqual(T.parse(
  T.serialize({
    optional_int32: 'foo'
  })
).optional_int32, 0, 'Number conversion');

assert.strictEqual(T.parse(
  T.serialize({
    optional_int32: {}
  })
).optional_int32, 0, 'Number conversion');

assert.strictEqual(T.parse(
  T.serialize({
    optional_int32: null
  })
).optional_int32, undefined, 'null');

assert.throws(function() {
  T.serialize({
    optional_nested_enum: 'foo'
  });
}, Error, 'Unknown enum');

assert.throws(function() {
  T.serialize({
    optional_nested_message: 3
  });
}, Error, 'Not an object');

assert.throws(function() {
  T.serialize({
    repeated_nested_message: ''
  });
}, Error, 'Not an array');

assert.bufferEqual(T.parse(
  T.serialize({
   optional_bytes: new Buffer('foo')
  })
).optional_bytes, new Buffer('foo'));

assert.bufferEqual(T.parse(
  T.serialize({
   optional_bytes: 'foo'
  })
).optional_bytes, new Buffer('foo'));

assert.bufferEqual(T.parse(
  T.serialize({
   optional_bytes: '\u20ac'
  })
).optional_bytes, new Buffer('\u00e2\u0082\u00ac', 'binary'));

assert.bufferEqual(T.parse(
  T.serialize({
   optional_bytes: '\u0000'
  })
).optional_bytes, new Buffer('\u0000', 'binary'));

assert.equal(T.parse(
  T.serialize({
   optional_string: new Buffer('f\u0000o')
  })
).optional_string, 'f\u0000o');

puts('Success');
