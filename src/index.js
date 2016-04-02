// import I from 'immutable';
import fs from  'fs';
import crypto from 'crypto';
import { seq, compose, map, toArray } from 'transducers.js';
import convertDates from './date.js';

fs.readFile('tests/fixtures/simple.json', transform);

function transform(err, data) {
  var resources = JSON.parse(data);
  var transformed = transformResources(resources.orders);
  var path = 'tests/fixtures/simple-transformed.json';
  data = JSON.stringify(transformed)

  fs.writeFile(path, data, function(err) {
    console.log('error: %s', err);
  });
}

function transformResources(rs) {
  var withUUID = seq(rs, map(createUUIDs));
  var baseTransformed = transformBase(withUUID);

  return baseTransformed;
}

function transformBase(ob) {
  return seq(
    ob,
    compose(
      map(convertDates)
    )
  );
}

function createUUIDs(order) {
  var shasum = crypto.createHash('sha1');
  shasum.update(JSON.stringify(order));
  order['uuid'] = shasum.digest('hex');

  return order;
}
