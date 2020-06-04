var AWS = require("aws-sdk");
var sns = new AWS.SNS({ region: process.env.SNS_REGION });

const newsletterTopic = process.env.NEWSLETTER_TOPIC_ARN;
const notificationTopic = process.env.NOTIFICATION_TOPIC_ARN;
const snsActive = process.env.ENABLE_SNS;
const smsNumber = process.env.TEST_SMS;


const publish = async (params) => {
    try {
        if (snsActive) {
            await sns.publish(params).promise();
            console.log("[publish] message successfully published: ", params);
        } else {
            console.log("[publish] SNS inactive");
        }
    } catch (error) {
        console.log("[publish] error when trying to send message: ", params);
        console.log(error); // an error occurred
    }
}


const notifySubscription = async (message, subject) => {
    if (notificationTopic) {
        var params = {
            Message: message,
            TopicArn: notificationTopic,
            Subject: subject
        };
        console.log(`[notifySubscription] sending notification to ${notificationTopic}`);
        await publish(params);
    } else {
        console.log('[notifySubscription] NOTIFICATION_TOPIC_ARN not configured');
    }
}


//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#publish-property
const publishSNSMessage = async (params) => {
    if (params.PhoneNumber && params.TopicArn) {
        console.log("[publishSNSMessage] messages must be sent to PhoneNumber or sns TopicArn");
    } else if (params.PhoneNumber || params.TopicArn) {
        console.log("[publishSNSMessage] trying to publish message: ", params);
        if (smsNumber && params.PhoneNumber) {
            params.PhoneNumber = smsNumber;
        }
        await publish(params);
    } else {
        console.log("[publishSNSMessage] message not published: ", params);
    }
}


//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#subscribe-property
const subscribe = async (phoneNumber) => {
    console.log("[subscribe] config subscription request params");
    var params = {
        Protocol: 'sms',
        TopicArn: newsletterTopic,
        Endpoint: phoneNumber,
        ReturnSubscriptionArn: true
    };

    console.log("sending SNS subscribe request")
    let subscriptionResult = await sns.subscribe(params).promise();
    await notifySubscription(`Um novo ouvinte se cadastrou nas notificações ${phoneNumber}`, '🤓 [LAMPIÃO] Você tem um novo ouvinte 😎😄');
    console.log("SNS subscribe request completed");

    return subscriptionResult.SubscriptionArn;
}

//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#unsubscribe-property
const unsubscribe = async (subscriptionArn) => {
    console.log("[unsubscribe] set SUBSCRIPTION request params");
    var params = {
        SubscriptionArn: subscriptionArn
    };
    console.log("[unsubscribe] send UNSUBSCRIBE request to SNS: ", subscriptionArn);
    var result = await sns.unsubscribe(params).promise();
    await notifySubscription('Alguém decidiu deixar de receber as notificações.', '🤓 [LAMPIÃO] Pelo menos você vai economizar nas notificações 😥🤷‍♂️');
    console.log("[unsubscribe] UNSUBSCRIBE request completed ", JSON.stringify(result));
};

exports.subscribe = subscribe;
exports.unsubscribe = unsubscribe;
exports.publishSNSMessage = publishSNSMessage;
