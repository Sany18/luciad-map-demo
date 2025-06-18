const express = require('express');
const http = require('http');
const path = require('path');
const app = new express();

const { getFilesTree } = require('./utils');

app.use(express.static(path.join(__dirname, 'pages')));

app.use('/reports_data', express.static(path.join(__dirname, 'reports_data')));

app.get('/list-reports', (req, res) => {
  try {
    const dirPath = path.join(__dirname, 'reports_data');
    const tree = getFilesTree(dirPath);
    res.json(tree);
  } catch (err) {
    res.status(500).json({ error: 'Unable to read directory' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages/index.html'));
});

const httpServer = http.createServer(app);
httpServer.listen(30_000);
