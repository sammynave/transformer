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
  var resources = JSON.parse(data);
  console.log(resources);
  var tables = seq(
    resources,
    compose(
      map(writeTable)
    )
  );

  var path = 'tests/fixtures/simple-transformed.json';

  fs.writeFile(path, JSON.stringify(tables), function(err) {
    console.log('error: %s', err);
  });
}

function writeTable(x) {
  return [x[0], transformResources(x[1])];
}

function transformResources(rs) {
  return seq(
    rs,
    compose(
      map(createUUIDs),
      map(convertDates)
    )
  );
}

function isObject(x) {
  return x[1] instanceof Object;
}
function createUUIDs(rs) {
  var shasum = crypto.createHash('sha1');
  shasum.update(JSON.stringify(rs));
  rs['uuid'] = shasum.digest('hex');

  return rs;
}
