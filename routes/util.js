
var camelize = require('camelize');

convertCamel = function(dbRes) {
  var cameled = dbRes;
  if(dbRes && dbRes.length > 0) {
    cameled = camelize(dbRes);
  }
  return cameled;
};
createError = function(code, message) {
	var _err = new Error(message);
	_err.status = code;
	return _err;
};
const promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) { reject(err) }

      resolve(res);
    })
  );
module.exports.createError = createError;
module.exports.convertCamel = convertCamel;
module.exports.promisify = promisify;
