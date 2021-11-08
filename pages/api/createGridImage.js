import chromium from 'chrome-aws-lambda'
import AWS from 'aws-sdk'

const S3 = new AWS.S3({
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
	}
})

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
				width: 4000,
				height: 4000
			},
			ignoreHTTPSErrors: true
		})
	}

  // For Vercal/AWS Lambda
	return chromium.puppeteer.launch({
		args: chromium.args,
		defaultViewport: {
			width: 4000,
			height: 4000
		},
		executablePath,
		headless: chromium.headless,
		ignoreHTTPSErrors: true
	})
}

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
		const imageBuffer = await el.screenshot({type: 'png'})

		const fileName = 'xy/the_grid.png'

		const params = {
			Bucket: 'assets.nfty.dev',
			Key: fileName,
			Body: imageBuffer
		}

		S3.upload(params, (error, data) => {
			console.log(error, data)
			if (error) {
				return res.json({
					status: 'error',
					error: error.message || 'Something went wrong'
				})
			}

			const params = {
				Bucket: 'assets.nfty.dev',
				Key: fileName,
				Expires: 60
			}

			const signedURL = S3.getSignedUrl('getObject', params)

			res.json({
				status: 'ok',
				data: signedURL
			})
		})

		// upload this buffer on AWS S3
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