import moment from 'moment';
import { map, toObj, toArray } from 'transducers.js';

module.exports = function convertDates(order) {
  var keyVals = toArray(order);
  var vals = map(keyVals, function(kv) {
    if (isDate(kv[0]) && kv[1] !== null) {
      kv[1] = redshiftDate(kv[1]);
    }
    return kv;
  });

  return toObj(vals);
};

function redshiftDate(date) {
  return moment(date).utc().format('YYYY-MM-DD HH:mm:ss');
}

function isDate(str) {
  return str.slice(-3) === '_at';
}


