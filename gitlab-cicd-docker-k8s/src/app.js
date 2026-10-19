const express = require('express');
const os = require('os');

const app = express();

app.get('/', (req, res) => {
  res.json({
    mensagem: 'Olá! Pipeline CI/CD no GitLab funcionando 🚀',
    versao: process.env.APP_VERSION || 'dev',
    hostname: os.hostname(),
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = app;
