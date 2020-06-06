const OAuth = require('oauth');

let oauth_consumer_key = process.env.OAUTH_CONSUMER_KEY;
let oauth_token = process.env.OAUTH_TOKEN;
var consumer_secret = process.env.OAUTH_CONSUMER_SECRET;
var token_secret = process.env.OAUTH_TOKEN_SECRET;

//https://developer.twitter.com/en/docs/tweets/post-and-engage/api-reference/post-statuses-update
//https://developer.twitter.com/en/docs/trends/trends-for-location/api-reference/get-trends-place
//https://developer.twitter.com/en/docs/basics/authentication/oauth-1-0a/percent-encoding-parameters
//https://developer.twitter.com/en/docs/media/upload-media/api-reference/post-media-upload


var oauth = new OAuth.OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    oauth_consumer_key,
    consumer_secret,
    '1.0A', null, 'HMAC-SHA1'
);

const getTrendHashtag = () => new Promise((resolve, reject) => {
    console.log("[getTrendHashtag] looking for trends")
    oauth.get('https://api.twitter.com/1.1/trends/place.json?id=1',
        oauth_token,
        token_secret,
        function (error, twitterResponseData, result) {
            if (error) {
                console.log("[getTrendHashtag] error on trends");
                reject(error);
                return;
            }
            try {
                console.log('[getTrendHashtag] found it')
                var data = JSON.parse(twitterResponseData);
                var max = data[0].trends.reduce((a, b) => {
                    return (a.tweet_volume > b.tweet_volume) ? a : b
                });

                console.log(max);
                resolve(max.name);
            } catch (parseError) {
                console.log("[getTrendHashtag] error on trends");
                console.log(parseError);
                reject(parseError);
            }
            console.log(twitterResponseData);
        });
});


const twitte = (status, replyId) => new Promise((resolve, reject) => {
    let body = {
        status: status
    };
    if (replyId) {
        body.in_reply_to_status_id = replyId;
    }

    console.log('[twitte] body', JSON.stringify(body))
    oauth.post('https://api.twitter.com/1.1/statuses/update.json',
        oauth_token,
        token_secret,
        body,
        'application/x-www-form-urlencoded',
        function (error, twitterResponseData, result) {
            if (error) {
                console.log(error)
                reject(error);
                return;
            }
            try {
                var data = JSON.parse(twitterResponseData);
                console.log(`[twitte] ${data.id_str} [reply] ${replyId}`);
                resolve(data);
            } catch (parseError) {
                reject(parseError);
                console.log(parseError);
            }
        });
})


const updateTStatus = (status) => new Promise((resolve, reject) => {

    console.log('[updateTStatus] searching for trending topics');
    getTrendHashtag().then(trend => {
        console.log('[updateTStatus] updating feed with last episode');

        twitte(`Já ouviu o último episódio do 🇮🇪Vinking no Sertão 🌵? Corre lá e escuta ${status} #podcast #podcasting #spotify #radio #music #podcaster ${trend}`)
            .then(result => {
                setTimeout(function () {
                    console.log('[updateTStatus] sending reploy to twitter: ', result.id_str)
                    twitte(`Também disponível no \n@Castbox_fm https://bit.ly/2Uf9M49\n#GooglePodcasts https://bit.ly/2XCpEjq\n#Breaker https://bit.ly/2AFoJ91\n@pocketcasts https://bit.ly/2zcjT2C\n@RadioPublic https://bit.ly/373lQuy\n@Spotify https://spoti.fi/2UfjQuh\n`, result.id_str).then(() => console.log('replied'))
                }, 3000);
            })
    });
});



exports.updateTStatus = updateTStatus;