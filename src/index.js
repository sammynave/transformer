// import I from 'immutable';
import fs from  'fs';
import crypto from 'crypto';
import moment from 'moment';
import {
  seq,
  compose,
  map,
  toArray,
  filter,
  into,
  push
} from 'transducers.js';

fs.readFile('tests/fixtures/simple.json', transformBegin);

function transformBegin(err, data) {
  //TODO: don't hardcode this
  var type = 'orders';
  var path = 'tests/fixtures/simple-transformed.json';
  var tables = {};
  tables[`${type}`] = [];

  data = JSON.parse(data);

  into(
    tables[`${type}`],
    compose(
      map(createUUIDs),
      map(convertDates)
    ),
    data[`${type}`]
  );

  fs.writeFile(path, JSON.stringify(tables), function(err) {
    console.log('error: %s', err);
  });
}

function extractNested(resources) {
  return resources;
}

function isObject(x) {
  return x[1] instanceof Object;
}

function createUUIDs(resource) {
  resource['uuid'] = crypto.createHash('sha1').update(JSON.stringify(resource)).digest('hex');
  return resource;
}

function convertDates(resource) {
  return seq(
    resource,
    compose(
      map(convertDate)
    )
  );
};

function convertDate(kv) {
  var key = kv[0];
  var val = kv[1];
  if (isDate(key) && val !== null) {
    kv[1] = redshiftDate(val);
  }
  return kv;
}

function redshiftDate(date) {
  return moment(date).utc().format('YYYY-MM-DD HH:mm:ss');
}

function isDate(str) {
  return str.slice(-3) === '_at';
}

