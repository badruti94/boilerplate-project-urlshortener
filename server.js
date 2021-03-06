require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParse = require('body-parser')
const mongoose = require('mongoose')
const dns = require('dns')
const url = require('url')

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const Schema = mongoose.Schema;
const urlSchema = new Schema({
  url: String,
  short_url: String
})

const Url = mongoose.model('Url', urlSchema)



app.use(cors());

app.use(bodyParse.urlencoded({
  extended: false
}))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({
    greeting: 'hello API'
  });
});



app.get('/api/shorturl/:short_url',(req, res) => {
  Url.find({
    short_url : req.params.short_url
  }, (err, data) => {
    if (err) return console.error(err);
    res.redirect(data[0].url)
  })
})

app.post('/api/shorturl/new', (req, res) => {
  const input_url = req.body.url

  let host = url.parse(input_url).hostname
  if(host == null){
    host = 'abc'
  }
  dns.lookup(host, (err, address) => {
    if (err) res.json({error : 'invalid url'})

    const short_url = Math.floor(Math.random() * 1000)
    
    const url = Url({
      url: input_url,
      short_url: short_url
    })
    //res.json({tes: 'tes'})
    url.save((err, data) => {
      if (err) return console.log(err);
      res.json({
        original_url: input_url,
        short_url: short_url
      })
    })
  })

})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});