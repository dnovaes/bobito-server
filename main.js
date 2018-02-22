// BASE SETUP

var express     = require('express')
var app         = express()
var path        = require('path');
var bodyparser  = require('body-parser');
const port        = process.env.PORT || 3000;
const fs          = require('fs');
const user      = require('./routes/user');

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

  fs.readFile(filename, 'utf8', (err, data) => {
    if(err){
      console.log(`Arquivo '${filename}' not found or couldn't be created.`);
      console.log(`Arquivo '${filename}' will be created.`);
      data = {
        b: '0', s: '0', o: '0', 
        g1: '0', g2: '0', g3: '0', g4: '0', g5: '0', g6: '0', g7: '0', g8: '0', g9: '0',
        h1: '1', h2: '0', h3: '0', h4: '0', h5: '0', h6: '0', h7: '0', h8: '0', h9: '0'
      }

      data = JSON.stringify(data);

      console.log(data);

      fs.writeFile('scoreboard.json', data, 'utf8',function (err) {
        if (err){
          console.log(err);
          res.send({"fail":1});
        }
        console.log("scoreBoard updated with new file");
        let scoreObj = JSON.parse(data);
        res.send(scoreObj);

      });
    }else{
      //render json info with data loaded
      let scoreObj = JSON.parse(data);
      res.send(scoreObj);
    }
  });
});

router.post('/scoreBoard/update/', function(req, res){
    if(req.body.constructor === Object && Object.keys(req.body).length == 21){
      console.log(req.body);
      let json = JSON.stringify(req.body);
      //async
      fs.writeFile('scoreboard.json', json, 'utf8',function (err) {
        if (err){
          console.log(err);
          res.send({"fail":1});
        }
        console.log("scoreBoard updated.");
        res.send({"ok":1});
      });
    }else{
      res.send({"fail":1});
    }
});

//route that handle ajax requests
//in case of post request, all "variable" are passed in req.body
router.post('/gloin', user.signin);

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
