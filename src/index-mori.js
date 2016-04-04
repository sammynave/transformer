import m from 'mori';
import fs from  'fs';
import crypto from 'crypto';
import moment from 'moment';

fs.readFile('tests/fixtures/orders-big.json', begin);

function begin(err, data) {
  var path = 'tests/fixtures/simple-transformed.json';
  var file = m.toClj(JSON.parse(data))

  console.time('transform');
  var orders = m.get(file, 'orders');
  var xf = m.comp(uuid, compact, convertDates);
  var newOrders = m.map(xf, orders);

  var a = m.toJs(newOrders)
  console.timeEnd('transform');

  console.log('base: %s', JSON.stringify(m.toJs(newOrders)));
  //console.log('nested: %s', JSON.stringify(nestedResources));
}

function transform(obj) {
  return obj.map(uuid).map(removeNull).map(convertDates);
}

function filterMaps(obj) {
  return obj.filter(x => I.Map.isMap(x));
}

function uuid(col) {
  var uuid = crypto.createHash('sha1').update(JSON.stringify(m.toJs(col))).digest('hex');
  return m.merge(col, m.hashMap("uuid", uuid));
}

function compact(col) {
  function isNull(elem) {
    var value = m.isMap(col) ? m.last(elem) : elem;
    return value !== null;
  }

  return m.into(m.empty(col), m.filter(isNull), col);
}

function convertDates(obj) {
  return obj;
  //return obj.keySeq().filter(isDate).map(k => convertDate(k, obj));
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
