const { publishSNSMessage, subscribe, unsubscribe } = require('./shared/sns');
const { updateListenerVerificationCode, deleteItem, getListenerByPhone, updateListenerSubscription, getListenerByPhoneNCode } = require("./shared/dynamo");
const { shouldPublishNewEpisode } = require('./shared/rss');
const { getShortLink } = require('./shared/bitly');
const { updateTStatus } = require('./shared/twitter')
let Parser = require('rss-parser');
let parser = new Parser();


const cors = process.env.CORS;
const newsletterTopic = process.env.NEWSLETTER_TOPIC_ARN;

const getExpireDate = () => {
    var currentDate = new Date();
    currentDate.setMinutes(currentDate.getMinutes() + 15);
    return currentDate;
}

const getCode = () => Math.random().toString(36).substr(2, 6);

exports.new_listener_handler = async (event) => {
    let response = {
        statusCode: 200,
        body: JSON.stringify('Telefone cadastrado!'),
    };


    try {

        for (var i = 0; i < event.Records.length; i++) {
            const record = event.Records[i];
            if (record.eventName === "INSERT") {
                console.log(`========= START SUBSCRIPTION FLOW`);
                const phone = record.dynamodb.Keys.phone.S
                console.log(`I (${phone}) want to listen to your podcast`);
                const code = getCode();
                console.log(`Use the code "${code}" to confirm you are not a machine`);
                await updateListenerVerificationCode(phone, code, getExpireDate().getTime());

                console.log(`trying to send sms to ${record.dynamodb.Keys.phone.S} with activation code: ${code}`);

                var params = {
                    Message: `Seu código de ativação no Viking do Sertão é: ${code}.`, /* required */
                    PhoneNumber: phone,
                    Subject: 'Bem vindo ao Viking do Sertão'
                };

                await publishSNSMessage(params);


                console.log(`========= FINISH SUBSCRIPTION FLOW ${JSON.stringify(response)}`);
            } else {
                console.log(`${record.eventName} != INSERT`);
            }
        }

    } catch (e) {
        console.log(e);
        response = {
            statusCode: 400,
            body: JSON.stringify('Oops, deu algo errado :)'),
        };
    }

    return response;
};

exports.unsubscribe_handler = async (event) => {
    let response = {};
    const { phone } = JSON.parse(event.body);
    console.log(`========= START UNSUBSCRIBE FLOW ${phone}`);
    console.log(`search for phone number: ${phone}`);
    var result = await getListenerByPhone(phone);

    if (result && result.Items.length > 0) {
        console.log('phone number found');
        let subscriptionArn = result.Items[0].subscription;
        if (subscriptionArn) {
            await unsubscribe(result.Items[0].subscription, phone);
        } else {
            console.log("SUBSCRIPTION not found. skip unsubscription");
        }
        await deleteItem(result.Items[0].phone);
        response = {
            statusCode: 200,
            headers: {
                //https://stackoverflow.com/questions/35190615/api-gateway-cors-no-access-control-allow-origin-header
                "Access-Control-Allow-Origin": `${cors}`, // Required for CORS support to work
            },
            body: JSON.stringify('Telefone removido!'),
        };
    } else {
        console.log("item not found");
        response = {
            headers: {
                "Access-Control-Allow-Origin": `${cors}`, // Required for CORS support to work
            },
            statusCode: 404,
            body: JSON.stringify('Phone number not found')
        }
    }

    console.log(`========= FINISH UNSUBSCRIBE FLOW: ${JSON.stringify(response)}`);

    return response;
};


exports.confirm_subscription_handler = async (event) => {
    let response = {};
    const { phone, code } = event.queryStringParameters;
    console.log(`========= START CONFIRMATION FLOW ${phone} and ${code}`);
    var result = await getListenerByPhoneNCode(phone, code);
    if (result && result.Items.length > 0) {
        console.log('phone number found');
        let subscriptionArn = await subscribe(`+${result.Items[0].phone}`);
        await updateListenerSubscription(result.Items[0].phone, subscriptionArn);
        response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": `${cors}`, // Required for CORS support to work
            },
            body: JSON.stringify("Phone number not found")
        }
    } else {
        console.log("item not found");
        response.statusCode = 404;
        response.headers = {
            "Access-Control-Allow-Origin": `${cors}`, // Required for CORS support to work
        };
        response.body = JSON.stringify("Phone number not found");
    }

    console.log(`========= FINISH CONFIRMATION FLOW ${JSON.stringify(response)}`);

    return response;
};

exports.handler_feed_spy = async (event) => {
    let response = {
        statusCode: 200,
        body: JSON.stringify('OK')
    }

    let feed = await parser.parseURL('https://anchor.fm/s/12d84f70/podcast/rss');
    const lastEpisode = feed.items.length - 1;

    console.info(`[handler_feed_spy] check if the episode ${lastEpisode} is the latest one`);

    if (await shouldPublishNewEpisode(lastEpisode)) {

        console.log('[handler_feed_spy] get short ling before publish new episode');
        var link = null;
        await getShortLink(feed.items[0].link)
            .then(result => {
                console.log(`[handler_feed_spy] short link created`);
                console.log(result.link)
                link = result.link;
            })
            .catch(err => {
                console.error(`[handler_feed_spy] error when requesting short link: ${err}`);
            });

        if (link) {
            var params = {
                Message: `Já ouviu o último episódio do Viking do Sertão? Vai lá e confere ${link}`,
                Subject: 'Viking do Sertão',
                TopicArn: newsletterTopic
            };
            await publishSNSMessage(params);
            await updateTStatus(link)
                .then(result => {
                    console.log('[handler_feed_spy] new episode published on twitter');
                    console.log(result);
                })
                .catch(err => {
                    console.error(`[handler_feed_spy] error when publishing on twitter: ${err}`);
                });
        } else {
            console.log("[handler_feed_spy] short link not created = episode not published on sns")
        }

    } else {
        console.log('[handler_feed_spy] no updates');
    }

    return response;
};