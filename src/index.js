import I from 'immutable';
import fs from  'fs';
import crypto from 'crypto';
import moment from 'moment';
import {
  seq,
  compose,
  map,
  toArray,
  toObj,
  filter,
  into,
  push
} from 'transducers.js';

fs.readFile('tests/fixtures/simple.json', transformBegin);

function transformBegin(err, data) {
  //TODO: don't hardcode this
  var path = 'tests/fixtures/simple-transformed.json';
  var rawData = I.Map(JSON.parse(data));
  var createBaseTable = compose(
    map(createUUIDs),
    map(convertDates),
    map(stringifyNested)
  );

  var baseTable = seq(rawData, createBaseTable);

  fs.writeFile(path, JSON.stringify(baseTable), function(err) {
    console.log('error: %s', err);
  });

 //  var nestedTables = seq(
 //    toArray(baseTable)[0][1],
 //    compose(
 //      map(filterNested)
 //    )
 //  );

 //  console.log(nestedTables);
}

function stringifyNested(obj) {
  return obj;
}

function createUUIDs(resource) {
  var type = resource[0]; //e.g. 'orders'
  var objects = resource[1]; //e.g. [{id:1 }, ..., {id:n}]

  objects.forEach(function(obj) {
    obj['uuid'] = crypto.createHash('sha1').update(JSON.stringify(obj)).digest('hex');
  });

  return resource;
}

function convertDates(resource) {
  var type = resource[0];
  var objects = resource[1];

  resource[1] = seq(
    objects,
    map(function(obj) {
      return seq(
        obj,
        map(function(kv){
          if (isDate(kv)) {
            kv[1] = redshiftDate(kv[1]);
          }

          return kv;
        })
      )
    })
  );

  return resource;
};

function filterNested(x){
  return seq(x, filter(isObject));
}

function isObject(x) {
  return x[1] instanceof Object;
}

function redshiftDate(date) {
  return moment(date).utc().format('YYYY-MM-DD HH:mm:ss');
}

function isDate(kv) {
  return kv[0].slice(-3) === '_at' && kv[1] !== null;
}
