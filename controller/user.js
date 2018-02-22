const db =  require('../config/db.js');

exports.signin = (req, res) => {

    if(req.body.constructor === Object && Object.keys(req.body).length == 2 &&
        req.body.username != "" && req.body.password != ""){

      var username = req.body.username;
      var password = req.body.password;

      db.getConnection( (err, con) => {

        if (err) throw err;
        //console.log("Connected!");

        let sql = "SELECT username, password FROM login WHERE username = ?";

        con.query(sql, [username], (err, result, fields) => {
          con.release();

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
        });
      });

    }else{
      //console.log(Object.keys(req.body).length, req.body);
      let obj = { "fLogin": 0}
      let json = JSON.stringify(obj);
      res.send(json);

    }
}
