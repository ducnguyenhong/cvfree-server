const express = require('express');
const app = express();
const port = require('./constants').serverPort
const morgan = require('morgan');
const path = require('path');
const route = require('./routes');
const db = require('./configs/db')
const bodyParser = require('body-parser')
const cors = require('cors')

// connect MongoDB
db.connect()

// path static
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(cors())
app.use(bodyParser.json());


// HTTP logger
app.use(morgan('combined'));

// Route
route(app);

app.listen(port, () => {
  console.log(`CVFREE SERVER`, port);
});
