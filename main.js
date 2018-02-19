// BASE SETUP

var express    = require('express')
var app        = express()
var path       = require('path');
var bodyparser = require('body-parser');
var port       = process.env.PORT || 3000;
var fs = require('fs');

// There is a special routing method which is not derived from any HTTP method. 
// This method is used for loading middleware functions at a path for all request methods.
// app.all()

//set our default template engine to "ejs"
// which prevents the need for using file extensions. (pug, ejs...)
app.set('view engine', 'ejs');

//set views for 505, 404 and other view pages
app.set('views', path.join(__dirname, 'views'));

//set path for static files (css, images...)
app.use(express.static(path.join(__dirname, 'public')));

//parse request bodies (req.body / POST )
//app.use(bodyparser());
app.use(bodyparser.urlencoded({ extended: true}));
app.use(bodyparser.json());

//load file of route configs | also called as controllers
//require('./controller/routing.js')(app, { verbose: !module.parent, express: express });

var router = express.Router();

router.get('/', function (req, res){
  res.render('index');
});

router.get('/scoreBoard/get/', function (req, res){
  let filename = path.join(__dirname, "scoreboard.json");
  var fread;

  if(fread = fs.readFileSync(filename, 'utf8')){
    let scoreObj = JSON.parse(fread);
    res.send(scoreObj);
  }else{
    console.log(`Arquivo '${filename}' não encontrado ou não pôde ser aberto.`);
    //res.status(404).render('404', { url: req.originalUrl });
    res.send({"fail":1});
  }
});

router.post('/scoreBoard/update/', function(req, res){
    if(req.body.constructor === Object && Object.keys(req.body).length == 21){
      let json = JSON.stringify(req.body);
      //async
      fs.writeFile('scoreboard.json', json, 'utf8',function (err) {
        if (err) return console.log(err);
        console.log("scoreBoard file updated.");
        //console.log(json);
        res.send({"ok":1});
      });
    }else{
      res.send({"fail":1});
    }
});

//route that handle ajax requests
//in case of post request, all "variable" are passed in req.body
router.post('/gloin/', function(req, res){

    const mysql = require('mysql');

    if(req.body.constructor === Object && Object.keys(req.body).length == 2 &&
        req.body.username != "" && req.body.password != ""){

      var username = req.body.username;
      var password = req.body.password;

      let con = mysql.createConnection({
        host: "mysql552.umbler.com",
        user: "bobitobot_adminu",
        password: "#7wyf/Q3VGJPc9",
        database: "bobitobot_db"
      });

      con.connect((err) =>{
        if (err) throw err;
        //console.log("Connected!");

        let sql = "SELECT username, password FROM login WHERE username = ?";

        con.query(sql, [username], (err, result, fields) => {
          if (err) throw err;
          let obj;

          if(result.length == 0 || result[0].password != password){
            //user not found or incorrect pass
            console.log("Username or Password incorrect");
            obj = { "fLogin": 0}
          }else{
            console.log(`User "${username}" logado com sucesso!`);
            obj = { "fLogin": 1}
          }
          let json = JSON.stringify(obj);
          res.send(json);
          con.end();
        });
      });
    }else{
      console.log(Object.keys(req.body).length, req.body);
      let obj = { "fLogin": 0}
      let json = JSON.stringify(obj);
      res.send(json);
    }

});

// route with parameters ex: localhost:8081/elastic/:id
router.get('/elastic/:id', function(req, res){
    var routePath = "Route path: "+req.originalUrl;
    var fullUrl = "Request URL: "+ "http://"+req.hostname+":"+port+req.originalUrl;

    // body content
    var body = "<p>"+routePath+"</p>";
    body+= "<p>"+fullUrl+"</p>";
    body+= "<p>Params: "+JSON.stringify(req.params)+"</p>";

    res.send(body);
});

//router contain functions that not allow the request to go beyound it (res.send)
app.use('/', router);

//app.use('/public', express.static(__dirname + '/public'));


//ERRORS:
//mount the app requests with the functions
app.use(function (err, req, res, next){
    //log it
    if (!module.parent) console.error(err.stack);

    //error page
    res.status(500).render('5xx');
});

//last middleware response: 404 page error
app.use(function(req, res, next){
    res.status(404).render('404', { url: req.originalUrl });
});

// START THE SERVER
if(!module.parent) {
  app.listen(port);
  console.log("Server started at the port: "+port);
}
