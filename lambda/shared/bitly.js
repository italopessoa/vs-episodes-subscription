const https = require('https')

const bitly_group = process.env.BITLY_GROUP;
const bitly_token = process.env.BITLY_TOKEN;

//https://stackoverflow.com/questions/47404325/aws-lambda-http-post-request-node-js
const getShortLink = (link) => {

    const data = {
        "group_guid": bitly_group,
        "domain": "bit.ly",
        "long_url": link
    };

    console.log("[getShortLink] GENERATE SHORT URL FOR ", data);
    return new Promise((resolve, reject) => {
        const options = {
            host: 'api-ssl.bitly.com',
            path: '/v4/shorten',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${bitly_token}`
            }
        };

        //create the request object with the callback with the result
        const req = https.request(options, (res) => {
            res.on('data', (d) => {
                var temp = JSON.parse(d.toString());
                resolve(temp);
            });
        });

        // handle the possible errors
        req.on('error', (e) => {
            reject(e.message);
        });

        //do the request
        req.write(JSON.stringify(data));

        //finish the request
        req.end();
    });
};


exports.getShortLink = getShortLink;