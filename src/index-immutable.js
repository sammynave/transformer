import I from 'immutable';
import fs from  'fs';
import crypto from 'crypto';
import moment from 'moment';

fs.readFile('tests/fixtures/orders-big.json', begin);

function begin(err, data) {
  console.time('transform');
  var path = 'tests/fixtures/simple-transformed.json';
  var file = I.fromJS(JSON.parse(data)).get('orders');

  var base = file
  .map(uuid)              //1. addUuid to base obj
  .map(removeNull)        //2. drop null from base obj
  .flatMap(convertDates); //3. convert dates in base obj

  //var nestedResources = base.map(filterMaps).map(transform);
  console.timeEnd('transform');


  console.log('base: %s', JSON.stringify(base));
  //console.log('nested: %s', JSON.stringify(nestedResources));
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
