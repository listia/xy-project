import chromium from 'chrome-aws-lambda'
import axios from "axios";

const uploadImageURL = 'https://xyproject.io/api/uploadGridImage';

async function getBrowserInstance() {
	const executablePath = await chromium.executablePath

  // For Local Dev
	if (!executablePath) {
		// running locally
		const puppeteer = require('puppeteer')
		return puppeteer.launch({
			args: chromium.args,
			headless: true,
			defaultViewport: {
				width: 2000,
				height: 2000
			},
			ignoreHTTPSErrors: true
		})
	}

  // For Vercal/AWS Lambda
	return chromium.puppeteer.launch({
		args: chromium.args,
		defaultViewport: {
			width: 2000,
			height: 2000
		},
		executablePath,
		headless: chromium.headless,
		ignoreHTTPSErrors: true
	})
}

const uploadImage = async (imageBuffer) => {
  await axios({
    method: 'POST',
    url: uploadImageURL,
    data: {
      image: imageBuffer
    }
  }).then((response) => {
    console.log(response);
  }).catch(error => {
    console.log(error);
  })
};

export default async (req, res) => {
	const url = "https://xyproject.io?live=1"//req.body.url

	// Perform URL validation
	if (!url || !url.trim()) {
		res.json({
			status: 'error',
			error: 'Use a valid URL'
		})

		return
	}

	let browser = null

	try {
		browser = await getBrowserInstance()
		let page = await browser.newPage()
    await page.setDefaultNavigationTimeout(0);
		await page.goto(url, {waitUntil: 'networkidle0'})
    const el = await page.$('#squares');
		let imageBuffer = await el.screenshot({encoding: 'base64'})
    imageBuffer = 'data:image/png;base64,' + imageBuffer;

    await uploadImage(imageBuffer);

		res.json({
			status: 'ok',
			data: ''
		})

	} catch (error) {
		console.log(error)
		res.json({
			status: 'error',
			data: error.message || 'Something went wrong'
		})
		// return callback(error);
	} finally {
		if (browser !== null) {
			await browser.close()
		}
	}
}