import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium-min';
import puppeteerCore from 'puppeteer-core';
import { NODE_ENV, PORT } from './config.js'

const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Versión actualizada basada en el artículo
const getPdf = async (html, customOptions = null) => {
  let browser = null;
  try {
    if (NODE_ENV === 'development') {
      console.log('Development browser: ');
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    } else {
      console.log('Production browser: ');
      const executablePath = await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar');
      browser = await puppeteerCore.launch({
        executablePath,
        args: chromium.args,
        headless: chromium.headless,
        defaultViewport: chromium.defaultViewport
      });
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Opciones predeterminadas
    const defaultOptions = {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '94px',
        right: '94px',
        bottom: '94px',
        left: '94px'
      }
    };

    // Usar opciones personalizadas si se proporcionan
    const pdfOptions = customOptions || defaultOptions;

    const pdfBuffer = await page.pdf(pdfOptions);
    return pdfBuffer;
  } catch (error) {
    console.error('Error en getPdf:', error);
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
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': 'attachment; filename="documento.pdf"',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(pdfBuffer);
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

    const customOptions = {
      landscape: true,
      printBackground: true,
      margin: {
        top: '5px',
        right: '5px',
        bottom: '5px',
        left: '5px'
      }
    };

    const pdfBuffer = await getPdf(html, customOptions);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': 'attachment; filename="documento.pdf"',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(pdfBuffer);
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).send('Error al generar PDF: ' + error.message);
  }
});

app.post('/htmlpdfpesv', async (req, res) => {
  try {
    const { html } = req.body;

    if (!html) {
      return res.status(400).send('No se proporcionó HTML');
    }

    const customOptions = {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15px',
        right: '15px',
        bottom: '15px',
        left: '15px'
      }
    };

    const pdfBuffer = await getPdf(html, customOptions);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': 'attachment; filename="documento.pdf"',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(pdfBuffer);
  } catch (error) {
    console.error('Error al generar PDF:', error);
    res.status(500).send('Error al generar PDF: ' + error.message);
  }
});

export default app;
