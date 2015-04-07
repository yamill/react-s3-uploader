var mime = require('mime'),
    uuid = require('node-uuid'),
    aws = require('aws-sdk'),
    express = require('express');

function S3Router(options) {

    var S3_BUCKET = options.bucket;

    if (!S3_BUCKET) {
        throw new Error("S3_BUCKET is required.");
    }

    var router = express.Router();

    /**
     * Returns an object with `signedUrl` and `publicUrl` properties that
     * give temporary access to PUT an object in an S3 bucket.
     */
    router.get('/sign', function(req, res) {
        var filename = uuid.v4() + "_" + req.query.objectName;
        var mimeType = mime.lookup(filename);

        var s3 = new aws.S3();
        var params = {
            Bucket: S3_BUCKET,
            Key: filename,
            Expires: 60,
            ContentType: mimeType,
            ACL: 'public-read'
        };
        s3.getSignedUrl('putObject', params, function(err, data) {
            if (err) {
                console.log(err);
                return res.send(500, "Cannot create S3 signed URL");
            }
            res.json({
                signedUrl: data,
                publicUrl: 'https://'+S3_BUCKET+'.s3.amazonaws.com/'+ filename,
                filename: filename
            });
        });
    });

    return router;
}

module.exports = S3Router;
