var mysql = require('mysql');

var connection = mysql.createPool({
  host    : "us-cdbr-iron-east-05.cleardb.net",
  user    : "b431bc05da5d41",
  password: "b55363f7",
  database: "heroku_790d86552026212"
});

module.exports = connection;
