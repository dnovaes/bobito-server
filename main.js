// BASE SETUP
import express      from 'express'
import db_Marketing from './config/db_pbMarketing';
import path         from 'path';
import bodyparser   from 'body-parser';
import fs           from 'fs';
import user         from './controller/user';

//Set up the express app
const app         = express()
const PORT = process.env.PORT || 3000;

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
//extended : parse nested objects. ex: {person: {name:cw}}
app.use(bodyparser.urlencoded({ extended: true}));
app.use(bodyparser.json());

//load file of route configs | also called as controllers
//require('./controller/routing.js')(app, { verbose: !module.parent, express: express });

var router = express.Router();

router.get('/', function (req, res){
  res.render('index');
});

//Pb MarketingRequests
//get All data
router.get('/graphicpieces/', (req, res) => {
  res.status(200).send({
    success: 'true',
    message: 'graphicpieces retrieved successfully',
    content: db_Marketing
  });
});
// create a graphicpiece
router.post('/graphicpieces/', (req, res) =>{
  if(!req.body.title){
    return res.status(404).send({
      success: 'false',
      message: 'title is required'
    });
  }else if(!req.body.type){
    return res.status(404).send({
      success: 'false',
      message: 'type is required'
    });
  }

  const content = {
    id: db_Marketing.length+1,
    title: req.body.title,
    type: req.body.type
  }
  db_Marketing.push(content);
  res.status(200).send({
    success: 'true',
    message: 'graphicpiece added successfully',
    content
  })

});
//get a single graphicpiece by type
//printed
router.get('/graphicpieces/digital/', (req, res) => {

  let contentMap = []
  db_Marketing.map((content) => {
    if(parseInt(content.type) === 1){
      contentMap.push(content)
    }
  });

  if(contentMap.length){
    return res.status(200).send({
      success: 'true',
      message: 'digital graphicpiece retrieved successfully',
      contentMap
    });
  }

  res.status(404).send({
    success: 'false',
    message: 'digital graphicPiece requested does not exist',
  });
});

router.get('/graphicpieces/printed/', (req, res) => {
  
  let contentMap = []
  db_Marketing.map((content) => {
    if(parseInt(content.type) === 2){
      contentMap.push(content)
    }
  });

  if(contentMap.length){
    return res.status(200).send({
      success: 'true',
      message: 'printed graphicpiece retrieved successfully',
      contentMap
    });
  }

  res.status(404).send({
    success: 'false',
    message: 'printed graphicPiece requested does not exist',
  });
});

//ArenaShimizu App requests
//digital
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
  app.listen(PORT, ()=>{
    console.log(`Server started at the port: ${PORT}`);
  });
}
