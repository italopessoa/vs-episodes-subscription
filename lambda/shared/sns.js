var AWS = require("aws-sdk");
var sns = new AWS.SNS();
const topicArn = process.env.SNS_TOPIC_ARN;

//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#publish-property
const sendNotificationMessage = async (phoneNumber, activationLink) => {
    console.log(`send activation link (${activationLink}) to new listener "${phoneNumber}"`);
    var params = {
        Message: `Ola, obrigado por se inscrever nas notificacoes do Viking do Sertao. Para terminar seus cadastro utilize este codigo basta clicar neste link: ${activationLink}.`, /* required */
        PhoneNumber: phoneNumber,
        Subject: 'Bem vindo ao Viking do Sertao'
    };
    console.log('publish SMS');
    /*sns.publish(params, function (err, data) {
        if (err) {
            console.log("error when trying to send SMS message with activation code");
            console.log(err, err.stack); // an error occurred
        }
        else {
            console.log("SMS message with activation code successfully delivered");
            console.log(data);           // successful response
        }
    });*/

}


//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#subscribe-property
const subscribe = async (phoneNumber) => {
    console.log("config subscription request params");
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
    console.log("set SUBSCRIPTION request params");
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

