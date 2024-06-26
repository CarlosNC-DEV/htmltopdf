import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';
import puppeteerCore from 'puppeteer-core';
import { NODE_ENV, PORT } from './config.js'

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const getPdf = async (html) => {
  let browser = null;
  if (NODE_ENV === 'development') {
    console.log('Development browser: ');
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });
  }
  if (NODE_ENV === 'production') {
    console.log('Production browser: ');
    browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  }
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20px',
      right: '20px',
      bottom: '20px',
      left: '20px'
    }
  });
  await browser.close();
  return pdfBuffer;
};

app.post('/html-to-pdf', async (req, res) => {
  try {
    const { html } = req.body;

    if (!html) {
      return res.status(400).send('No se proporcionó HTML');
    }

    const pdfBuffer = await getPdf(html);

    res.contentType('application/pdf');
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).send('Error al generar PDF: ' + error.message);
  }
});

export default app;
