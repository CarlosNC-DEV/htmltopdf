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
  try {
    if (NODE_ENV === 'development') {
      console.log('Development browser: ');
      browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
      });
    } else {
      console.log('Production browser: ');
      // Configuración específica para entornos serverless
      await chromium.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');
      
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true
      });
    }
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '94px',
        right: '94px',
        bottom: '94px',
        left: '94px'
      }
    });
    return pdfBuffer;
  } catch (error) {
    console.error('Error en getPdf:', error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
};

const getPdfLabel = async (html) => {
  let browser = null;
  try {
    if (NODE_ENV === 'development') {
      console.log('Development browser: ');
      browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
      });
    } else {
      console.log('Production browser: ');
      // Configuración específica para entornos serverless
      chromium.setHeadlessMode = true;
      chromium.setGraphicsMode = false;
      
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath({
          useChromium: true
        }),
        ignoreHTTPSErrors: true
      });
    }
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '9px',
        right: '9px',
        bottom: '9px',
        left: '9px'
      }
    });
    return pdfBuffer;
  } catch (error) {
    console.error('Error en getPdfLabel:', error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
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

app.post('/htmlpdflabelmatpel', async (req, res) => {
  try {
    const { html } = req.body;

    if (!html) {
      return res.status(400).send('No se proporcionó HTML');
    }

    const pdfBuffer = await getPdfLabel(html);

    res.contentType('application/pdf');
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).send('Error al generar PDF: ' + error.message);
  }
});

export default app;