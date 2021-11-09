import AWS from 'aws-sdk'

const S3 = new AWS.S3({
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
	}
})

export default async (req, res) => {
	try {
		const fileName = 'xy/the_grid_temp.png'
    let buf = Buffer.from(req.body.image.replace(/^data:image\/\w+;base64,/, ""),'base64')

		const params = {
			Bucket: 'assets.nfty.dev',
			Key: fileName,
			Body: buf,
      ContentEncoding: 'base64',
      ContentType: 'image/png'
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
	}
}