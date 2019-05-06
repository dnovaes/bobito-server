// BASE SETUP
const express       = require('express')
const db_Marketing  = require('./config/db_pbMarketing');
const path          = require('path');
const bodyparser    = require('body-parser');
const fs            = require('fs');
const user          = require('./controller/user');

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
//GET ALL data
router.get('/graphicpieces/', (req, res) => {
  res.status(200).send({
    success: 'true',
    message: 'graphicpieces retrieved successfully',
    content: db_Marketing
  });
});
//CREATE a graphicpiece
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
//GET a single graphicPiece by id
router.get('/graphicpieces/:id', (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  let content; //content of the element found

  if(!isNaN(parseFloat(id))){
    db_Marketing.map((elContent, index) => {
      if (elContent.id === id) {
          content = elContent
      }
    });

    if(content){
       return res.status(200).send({
         success: 'true',
         message: `graphicPiece id: ${id} selected successfuly`,
         content 
       });
    }else{
      return res.status(404).send({
        success: 'false',
        message: 'graphicPiece by Id  not found',
      });
    }
  }else{
    next();
  }
});

//GET a single graphicpiece by type
//digital
router.get('/graphicpieces/digital/', (req, res) => {

  let content = []
  db_Marketing.map((elContent) => {
    if(parseInt(elContent.type) === 1){
      content.push(elContent)
    }
  });

  if(content.length){
    return res.status(200).send({
      success: 'true',
      message: 'digital graphicpiece retrieved successfully',
      content
    });
  }else{
    return res.status(404).send({
      success: 'false',
      message: 'digital graphicPiece requested does not exist',
    });
  }
});
//printed
router.get('/graphicpieces/printed/', (req, res) => {
  
  let content = []
  db_Marketing.map((elContent) => {
    if(parseInt(elContent.type) === 2){
      content.push(elContent)
    }
  });

  if(content.length){
    return res.status(200).send({
      success: 'true',
      message: 'printed graphicpiece retrieved successfully',
      content
    });
  }else{
    return res.status(404).send({
      success: 'false',
      message: 'printed graphicPiece requested does not exist',
    });
  }

});
//UPDATE
app.put('/graphicpieces/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  let elContentFound;
  let elContentFoundIndex;
  db_Marketing.map((elContent, index) => {
    if (elContent.id === id) {
      elContentFound = elContent;
      elContentFoundIndex = index;
    }
  });

  if (!elContentFound) {
    return res.status(404).send({
      success: 'false',
      message: 'graphicPiece requested not found',
    });
  }

  if (!req.body.title) {
    return res.status(400).send({
      success: 'false',
      message: 'title is required',
    });
  } else if (!req.body.type) {
    return res.status(400).send({
      success: 'false',
      message: 'type is required',
    });
  }

  const content = {
    id: elContentFound.id,
    title: req.body.title || elContentFound.title,
    type: req.body.type || elContentFound.type,
  };

  db_Marketing.splice(elContentFoundIndex, 1, content);

  return res.status(201).send({
    success: 'true',
    message: `graphicPiece id: ${id} updated successfully`,
    content,
  });
});

//DELETE
router.delete('/graphicpieces/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  let elContentFound
  let elIndex

  db_Marketing.map((elContent, index) => {
    if (elContent.id === id) {
      elContentFound = elContent
      elIndex = index
    }
  });

  if(elContentFound){
    db_Marketing.splice(elIndex, 1);
    return res.status(200).send({
     success: 'true',
     message: `graphicPiece id: ${id} deleted successfuly`,
    });
  }else{
    return res.status(404).send({
      success: 'false',
      message: 'graphicPiece not found',
    });
  }
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
