var AWS = require("aws-sdk");
var sns = new AWS.SNS({region: process.env.SNS_REGION});
const topicArn = process.env.SNS_TOPIC_ARN;

//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#publish-property
const sendNotificationMessage = async (phoneNumber, activationCode) => {
    console.log(`[sendNotificationMessage] send activation code (${activationCode}) to new listener "${phoneNumber}"`);
    var params = {
        Message: `Seu código de ativação no Viking do Sertão é: ${activationCode}.`, /* required */
        PhoneNumber: '+353830784099',//phoneNumber,
        Subject: 'Bem vindo ao Viking do Sertão'
    };
    console.log('publish SMS');
    sns.publish(params, function (err, data) {
        if (err) {
            console.log("error when trying to send SMS message with activation code");
            console.log(err, err.stack); // an error occurred
        }
        else {
            console.log("SMS message with activation code successfully delivered");
            console.log(data);           // successful response
        }
    });

}


//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#subscribe-property
const subscribe = async (phoneNumber) => {
    console.log("[subscribe] config subscription request params");
    var params = {
        Protocol: 'sms',
        TopicArn: topicArn,
        Endpoint: phoneNumber,
        ReturnSubscriptionArn: true
    };

    console.log("sending SNS subscribe request")
    let subscriptionResult = await sns.subscribe(params).promise();
    console.log("SNS subscribe request completed");

    return subscriptionResult.SubscriptionArn;
}

//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#unsubscribe-property
const unsubscribe = async (subscriptionArn) => {
    console.log("[unsubscribe] set SUBSCRIPTION request params");
    var params = {
        SubscriptionArn: subscriptionArn
    };
    console.log("send UNSUBSCRIBE request to SNS: ", subscriptionArn);
    var result = await sns.unsubscribe(params).promise();
    console.log("UNSUBSCRIBE request completed ", JSON.stringify(result));
};

exports.sendNotificationMessage = sendNotificationMessage;
exports.subscribe = subscribe;
exports.unsubscribe = unsubscribe;

