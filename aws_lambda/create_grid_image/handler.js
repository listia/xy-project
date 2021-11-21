const AWS = require('aws-sdk')
const s3 = new AWS.S3({apiVersion: '2006-03-01'});
const chromium = require('chrome-aws-lambda');
const gm = require('gm').subClass({imageMagick: true});
const fs = require("fs");
const sizeOf = require('image-size')

const pageURLs = [
  "https://xyproject.io/4/16/16",
  "https://xyproject.io/4/48/16",
  "https://xyproject.io/4/80/16",
  "https://xyproject.io/4/112/16",
  "https://xyproject.io/4/16/48",
  "https://xyproject.io/4/48/48",
  "https://xyproject.io/4/80/48",
  "https://xyproject.io/4/112/48",
  "https://xyproject.io/4/16/80",
  "https://xyproject.io/4/48/80",
  "https://xyproject.io/4/80/80",
  "https://xyproject.io/4/112/80",
  "https://xyproject.io/4/16/112",
  "https://xyproject.io/4/48/112",
  "https://xyproject.io/4/80/112",
  "https://xyproject.io/4/112/112"
]

const agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36'

function stitchAndSave(width) {
  return new Promise( function(resolve,reject) {
    try {
      gm()
        .in('-page', '+0+0')
        .in('/tmp/0.png')
        .in('-page', '+'+width+'+0')
        .in('/tmp/1.png')
        .in('-page', '+'+2*width+'+0')
        .in('/tmp/2.png')
        .in('-page', '+'+3*width+'+0')
        .in('/tmp/3.png')
        .in('-page', '+0+'+width)
        .in('/tmp/4.png')
        .in('-page', '+'+width+'+'+width)
        .in('/tmp/5.png')
        .in('-page', '+'+2*width+'+'+width)
        .in('/tmp/6.png')
        .in('-page', '+'+3*width+'+'+width)
        .in('/tmp/7.png')
        .in('-page', '+0+'+2*width)
        .in('/tmp/8.png')
        .in('-page', '+'+width+'+'+2*width)
        .in('/tmp/9.png')
        .in('-page', '+'+2*width+'+'+2*width)
        .in('/tmp/10.png')
        .in('-page', '+'+3*width+'+'+2*width)
        .in('/tmp/11.png')
        .in('-page', '+0+'+3*width)
        .in('/tmp/12.png')
        .in('-page', '+'+width+'+'+3*width)
        .in('/tmp/13.png')
        .in('-page', '+'+2*width+'+'+3*width)
        .in('/tmp/14.png')
        .in('-page', '+'+3*width+'+'+3*width)
        .in('/tmp/15.png')
        .mosaic()  // Merges the images as a matrix
        .write('/tmp/stitched.png', function (err) {
            if (err) {
              console.log(err)
            } else {
              resolve()
            }
        });
    }
    catch (err) {
      console.log(err)
    }
  });
}


exports.capture = async (event, context) => {
  let result = null;
  let browser = null;
  let width = 0;

  console.log('Starting...')

  try {
    let cnt = 0
    for (const url of pageURLs) {
      browser = await chromium.puppeteer.launch({
        args: chromium.args,
    		defaultViewport: {
    			width: 1200,
    			height: 1200
    		},
        executablePath: await chromium.executablePath,
        headless: true,
        ignoreHTTPSErrors: true,
        dumpio: true
      });

      let page = await browser.newPage();
      await page.setUserAgent(agent)

      console.log('Navigating to page: ', url)

      await page.setDefaultNavigationTimeout(0);
      await page.goto(url, {waitUntil: 'networkidle0'})
      const el = await page.$('#squares');
      const buffer = await el.screenshot()
      result = await page.title()

      console.log('Writing image to disk: ', '/tmp/'+cnt+'.png')
      await fs.writeFileSync('/tmp/'+cnt+'.png', buffer);
      cnt++;

      console.log('Cleaning up browser...')
      await page.close();
      await browser.close();
    }
    
    console.log('Calculating size...')
    const dimensions = sizeOf('/tmp/0.png')
    width = dimensions.width
    console.log('Image raw width: ', width)
    // overlap one column/row
    width = width - Math.round(width/33);
    console.log('Image adjusted width: ', width)
    
    console.log('Stitching images together...')
    await stitchAndSave(width)

    const file = '/tmp/stitched.png'

    console.log('Checking new image size...')
    const newDimensions = sizeOf(file)

    if ((newDimensions.width > width * 4) && (newDimensions.height > width * 4) &&
         newDimensions.width > 3000 && newDimensions.height > 3000) {
      console.log('Opening stitched image...')
      const fileStream = await fs.createReadStream(file);

      // upload the image
      console.log('Uploading images to S3...')
      const fileName = 'xy/the_grid.png'
      const s3result = await s3
        .upload({
          Bucket: 'assets.nfty.dev',
          Key: fileName,
          Body: fileStream,
          ContentType: 'image/png'
        }).promise()

      console.log('S3 image URL:', s3result.Location)
    } else {
      console.log('Aborting upload - stitched image is too small.')
    }
  } catch (error) {
    console.log(error)
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
  return result
}