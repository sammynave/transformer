import I from 'immutable';
import R from 'ramda';
import fs from  'fs';
import crypto from 'crypto';
import moment from 'moment';

fs.readFile('tests/fixtures/orders-big.json', begin);

function begin(err, data) {
  console.time('transform');
  var path = 'tests/fixtures/simple-transformed.json';
  var file = JSON.parse(data)['orders'];
  var xf = R.pipe(
    R.map(uuid),
    R.map(removeNull),
    R.map(convertDates)
  );

  var base = xf(file);
  //console.log(base);

  var xf2 = R.pipe(
    R.map(filterMaps),
    R.map(transform)
  );

  var nestedResources = xf2(base);
  //console.log(nestedResources);

  console.timeEnd('transform');

  //console.log('base: %s', JSON.stringify(base));
  //console.log('nested: %s', JSON.stringify(nestedResources));
  //

}

function transform(obj) {
  var xf1 = R.pipe(
    R.map(uuid),
    R.map(removeNull),
    R.map(convertDates) //this should R.chain
  );

  return xf1(obj);
}

function filterMaps(obj) {
  return R.filter(R.is(Object), R.head(obj));
}

function uuid(obj) {
  var uuid = crypto.createHash('sha1').update(JSON.stringify(obj)).digest('hex');
  return R.merge(obj, {"uuid": uuid});
}

function removeNull(obj) {
  return R.filter(R.complement(R.isNil), obj);
}

function convertDates(obj) {
  var dateKeys = R.filter(isDate, R.keys(obj));
  return R.map(k => convertDate(k, obj), dateKeys);
}

function convertDate(k, obj) {
  var date = {};
  date[k] = redshiftDate(R.prop(k, obj));
  return R.merge(obj, date);
}

function isDate(k) {
  return k.length > 3 && k.slice(-3) === '_at';
}

function redshiftDate(date) {
  return moment(date).utc().format('YYYY-MM-DD HH:mm:ss');
}

