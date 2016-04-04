import I from 'immutable';
import fs from  'fs';
import crypto from 'crypto';
import moment from 'moment';
import { map, filter, comp, into, dedupe, mapcat } from 'transducers-js';

fs.readFile('tests/fixtures/orders-big.json', begin);


function begin(err, data) {

  var path = 'tests/fixtures/simple-transformed.json';
  var file = I.fromJS(JSON.parse(data)).get('orders');

  console.time('transform');
  var baseResource2 = [];
  var xf = comp(
    map(uuid),
    map(removeNull),
    mapcat(convertDates)
  );
  into(baseResource2, xf, file);

  var nestedResources2 = [];
  var xf2 = comp(
    map(filterMaps),
    map(transform)
  );
  into(nestedResources2, xf2, baseResource2);
  console.timeEnd('transform');

  //console.log(JSON.stringify(baseResource2)+'\n');
  //console.log(JSON.stringify(nestedResources2)+'\n');
}

function transform(obj) {
  return obj.map(uuid).map(removeNull).map(convertDates);
}

function filterMaps(obj) {
  return obj.filter(x => I.Map.isMap(x));
}

function uuid(obj) {
  var uuid = crypto.createHash('sha1').update(JSON.stringify(obj)).digest('hex');
  return obj.set("uuid", uuid);
}

function removeNull(obj) {
  return obj.toKeyedSeq().filter(val => val !== null).toMap();
}

function convertDates(obj) {
  return obj.keySeq().filter(isDate).map(k => convertDate(k, obj));
}

function convertDate(k, obj) {
  return obj.set(k, redshiftDate(obj.get(k)));
}

function redshiftDate(date) {
  return moment(date).utc().format('YYYY-MM-DD HH:mm:ss');
}

function isDate(k) {
  return k.length > 3 && k.slice(-3) === '_at';
}
