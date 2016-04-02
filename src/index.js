// import I from 'immutable';
import fs from  'fs';
import crypto from 'crypto';
import convertDates from './date.js';
import {
  seq,
  compose,
  map,
  toArray,
  filter
} from 'transducers.js';

fs.readFile('tests/fixtures/simple.json', transformBegin);

function transformBegin(err, data) {
  var tables = {};
  var resources = JSON.parse(data);
  tables["orders"] = transformResources(resources.orders);
  var path = 'tests/fixtures/simple-transformed.json';

  fs.writeFile(path, JSON.stringify(tables), function(err) {
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
