import express from 'express';
import { buildPain001Xml, Pain001Payload } from './iso20022/pain001';
import { buildPacs008Xml, Pacs008Payload } from './iso20022/pacs008';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/iso/pain001', (req, res) => {
  const payload = req.body as Pain001Payload;
  const xml = buildPain001Xml(payload);
  res.type('application/xml').send(xml);
});

app.post('/api/iso/pacs008', (req, res) => {
  const payload = req.body as Pacs008Payload;
  const xml = buildPacs008Xml(payload);
  res.type('application/xml').send(xml);
});

const port = process.env.PORT || 8011;
app.listen(port, () => {
  console.log(`message-adapter listening on http://localhost:${port}`);
});