
require('dotenv').config();
var cors = require('cors');
let Telegram      = require('node-telegram-bot-api');
let TelegramToken = '1801554762:AAFzgJO-LRPd9vnCbMv20JFxnBn8gqM7jjg';
let TelegramBot   = new Telegram(TelegramToken, {polling: true});
 
//let TelegramTokenDaiLy = '1621801321:AAFkmLlWBwAyONeQHlLLTmhiIesDVEtGYz0';
///let TelegramBotDaiLy   = new Telegram(TelegramTokenDaiLy, {polling: true});

let fs 			  = require('fs');
let https     	  = require('https');
let http     	  = require('http');
//let privateKey    = fs.readFileSync('./ssl/b86club.key', 'utf8');
//let certificate   = fs.readFileSync('./ssl/b86club.pem', 'utf8');
//let credentials   = {key: privateKey, cert: certificate};
 
const cert = fs.readFileSync('./ssl/x29.club/certificate.crt');
const ca = fs.readFileSync('./ssl/x29.club/ca_bundle.crt');
const key = fs.readFileSync('./ssl/x29.club/private.key');
let options = {
	cert: cert, // fs.readFileSync('./ssl/example.crt');
	ca: ca, // fs.readFileSync('./ssl/example.ca-bundle');
	key: key, // fs.readFileSync('./ssl/example.key');
	passphrase: '1102',
	requestCert: false,
    rejectUnauthorized: false
 };
let express       = require('express');
let app           = express();

app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200
}));
let port       = process.env.PORT || 5678;

let server 		  = https.createServer(options, app);

let expressWs  = require('express-ws')(app , server);
let bodyParser = require('body-parser');
var morgan = require('morgan');
// Setting & Connect to the Database
let configDB = require('./config/database');
let mongoose = require('mongoose');
require('mongoose-long')(mongoose); // INT 64bit
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex',   true);
 
// mongoose.set("debug", (collectionName, method, query, doc) => {
//     console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
// });
mongoose.connect(configDB.url, configDB.options); // kết nối tới database
// cấu hình tài khoản admin mặc định và các dữ liệu mặc định
require('./config/admin');
// đọc dữ liệu from
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
//app.use(morgan('combined'));
app.set('view engine', 'ejs'); // chỉ định view engine là ejs
app.set('views', './views');   // chỉ định thư mục view
// Serve static html, js, css, and image files from the 'public' directory
app.use(express.static('public'));

let redT = expressWs.getWss();
process.redT = redT;
redT.telegram = TelegramBot;

//redT.telegram_daily = TelegramBotDaiLy;
global['Transactions'] = [];
global['redT'] = redT;
global['userOnline'] = 0;
global['path_server'] = __dirname;
require('./app/Helpers/socketUser')(redT); // Add function socket
require('./routerHttp')(app, redT);   // load các routes HTTP
require('./routerCMS')(app, redT);	//load routes CMS
require('./routerSocket')(app, redT); // load các routes WebSocket
require('./app/Cron/taixiu')(redT);   // Chạy game Tài Xỉu
require('./app/Cron/baucua')(redT);   // Chạy game Bầu Cua
require('./config/cron')();
require('./app/Telegram/Telegram')(redT); // Telegram Bot

process.stdout.write("Init .");

let t = setInterval(function () {
	process.stdout.write(".");
},1000);

setTimeout(function(){
	console.log("\n");
	clearInterval(t);
	server.listen(443, function() {
		console.log("Server listen on port ", 443);
	});
	 
},15000);

process.on('uncaughtException', err => {
	console.error('There was an uncaught error', err)
});