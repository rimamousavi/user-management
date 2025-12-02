const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.resolve(__dirname, '../dist')));

app.get('/', function (req, res) {
    const pathToHtmlFile = path.resolve(__dirname, '../dist/index.html');
    res.sendFile(pathToHtmlFile);
});

app.listen(3000, function () {
    console.log('Application is running on http://localhost:3000');
});