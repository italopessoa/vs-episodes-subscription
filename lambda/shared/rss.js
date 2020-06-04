const AWS = require('aws-sdk');
var s3 = new AWS.S3();
var bucket = process.env.BUCKET;

const updateFile = async (params, lastEpisode) => {
    console.log(`update or create file with metadata ${lastEpisode}`)
    var createParams = {
        ...params,
        Body: null,
        Metadata: {
            "lastepisode": `${lastEpisode}`,
        }
    };
    await s3.putObject(createParams).promise();
    console.log('file created or updated');
};

const shouldPublishNewEpisode = async lastEpisode => {
    var result = false;
    var params = {
        Bucket: bucket,
        Key: "rss.json"
    };
    try {

        console.info('[shouldPublishNewEpisode] searching file');
        var file = await s3.getObject(params).promise();
        console.log('[shouldPublishNewEpisode] file was found ', file.Metadata)
        console.log(`[shouldPublishNewEpisode] comparing ${file.Metadata.lastepisode} < ${lastEpisode}`)
        if (parseInt(file.Metadata.lastepisode) < lastEpisode) {
            console.info('[shouldPublishNewEpisode] rss has a new episode');
            result = true;
            await updateFile(params, lastEpisode);
        } else {
            console.log('[shouldPublishNewEpisode] rss does not have new episodes');
            result = false;
        }
    }
    catch (e) {
        console.log('[shouldPublishNewEpisode] files does not exist');
        console.log('[shouldPublishNewEpisode] create new file');
        await updateFile(params, lastEpisode)
        console.log('[shouldPublishNewEpisode] new file created');
        result = true;
    }
    console.log("result ", result);
    return result;
};

exports.shouldPublishNewEpisode = shouldPublishNewEpisode;