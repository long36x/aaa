
let UserInfo = require('./app/Models/UserInfo');
let Telegram = require('./app/Models/Telegram');

module.exports = function(){
	UserInfo.updateMany({}, {'$set':{'veryphone':true, 'veryold':true}}).exec();
	Telegram.deleteMany({}).exec();
}
