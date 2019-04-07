const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const fs2 = require('mz/fs');
const uuid = require('uuid');
const redisDriver = require('promise-redis');
const tryjson = require('tryjson');

const uri = process.env.REDIS_URL;
const redis = redisDriver().createClient(uri);

redis.on('ready', async () => {
  console.log('Redis ready');
});

const app = express();

const port = process.env.PORT || 3333;

console.log('port:', port);

function getData(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(data[id]);
    }, 2000);  
  });
}

function getData2(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ data2: 'ok' });
    }, 2000);
  });
}

function listening() {
  console.log('listening');
}

app.listen(port, () => {
  listening();
});

app.use(bodyParser.json());

const data = {};

app.get('/redis/:id', async (req, res) => {
  const id = req.params.id;
  const data = tryjson.parse(await redis.get(id));
  res.json({ data });
});

app.put('/redis/:id', async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  await redis.set(id, tryjson.stringify(data));
  res.json({ ok: true });
});




app.get('/file', (req, res) => {
  fs.readFile('file.txt', 'utf-8', (err, data) => {
    if (err) {
      return res.status(404).json({ error: 'not found' });
    }
    res.json({ data });
  });
});

app.get('/file2', (req, res) => {
  fs2.readFile('file.txt', 'utf-8')
    .then((data) => {
      res.json({ data });
    })
    .catch((err) => {
      res.status(404).json({ error: 'not found' });
    });
});

app.get('/file3', async (req, res) => {
  //try {
    res.json({ data: await fs2.readFile('file.txt', 'utf-8') });
  //} catch (err) {
  //  res.status(404).json({ error: 'not found async' });
  //}
});

app.get('/data', (req, res) => {
  setTimeout(() => {
    res.json(data);
  }, 2000);
});

app.get('/data/:id', async (req, res) => {
  if (!data.hasOwnProperty(req.params.id)) {
    return res.status(404).json({ error: 'Not found' });
  }
  const promise = getData(req.params.id);
  const promise2 = getData2(req.params.id);

  const value = await promise;
  const value2 = await promise2;

  res.json({ value, value2, async: 'await' });

//  Promise.all([promise, promise2]).then((array) => {
//    res.json(array);
//  });

  //promise.then((value) => {
  //  promise2.then((value2) => {
  //    res.json({ value, value2 });
  //  });
  //});
  // res.json(getData(req.params.id));
  // res.json(getData(req.params.id));
});

app.put('/data/:id', (req, res) => {
  data[req.params.id] = req.body;
  res.status(201).end();
});

app.patch('/data/:id', (req, res) => {
  const old = data[req.params.id];
  const change = req.body;
  data[req.params.id] = { ...old, ...change };
  res.status(200).json({ patched: 'ok' });
});


app.delete('/data/:id', (req, res) => {
  if (!data.hasOwnProperty(req.params.id)) {
    return res.status(404).json({ error: 'Not found' });
  }
  delete data[req.params.id];
  res.status(200).json({ ok: true });
});

app.post('/data', (req, res) => {
  const id = uuid.v4();
  data[id] = req.body;
  res.status(201).json({ id });
});


app.get('/abc', (req, res) => {
  console.log('get abc');
  if (req.query.a === undefined) {
    return res.status(400).end('Error');
  }
  console.log(req.query.a);
  res.status(200);
  res.write('abc (get) ');
  res.write(req.query.a);
  res.end();
  // res.status(200).end('abc (get) ' + req.query.a);
});

app.get('/abc/:x', (req, res) => {
  console.log('/abc/:x server');
  console.log(req.params);
  res.end('/abc/:x response');
});

app.post('/abc', (req, res) => {
  console.log('post abc');
  console.log(req.body);
  res.status(200).end('abc (post)');
});




