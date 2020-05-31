var AWS = require("aws-sdk");
var dynamodb = new AWS.DynamoDB.DocumentClient();
var table = 'testetrigger';

const updateListenerItem = async (phoneNumber, updateExpression, expressionAttributeValues) => {
    console.log(`preparing update params for listener ${phoneNumber}`);
    var params = {
        TableName: table,
        Key: {
            "phone": phoneNumber
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues
    };

    console.log('sending update request');
    await dynamodb.update(params).promise();
}

const updateListenerSubscription = async (phoneNumber, subscriptionArn) => {
    const updateExpression = "set subscription=:subscription";
    const expressionAttributeValues = {
        ":subscription": subscriptionArn
    }
    console.log("config update subscription params");
    try {
        console.log("sending update susbscription request");
        await updateListenerItem(phoneNumber, updateExpression, expressionAttributeValues);
        console.log("update subscription request completed")
    } catch (e) {
        console.error(e, " ERROR when trying to update listener subscription");
    }
}

const getListenerByPhoneNCode = async (phoneNumber, code) => {
    console.log("set QUERY request params PHONE+CODE");
    var params = {
        TableName: table,
        KeyConditionExpression: "#italo = :phone",
        FilterExpression: "#code = :code",
        ExpressionAttributeNames: {
            "#italo": "phone",
            "#code": "code"
        },
        ExpressionAttributeValues: {
            ":code": code,
            ":phone": phoneNumber
        }
    };
    console.log("send QUERY request PHONE+CODE");
    var result = await dynamodb.query(params).promise();
    console.log("QUERY request completed PHONE+CODE");
    return result;
}

const getListenerByPhone = async (phoneNumber) => {
    console.log("set QUERY request params");
    var params = {
        TableName: table,
        KeyConditionExpression: "phone = :phone",
        ExpressionAttributeValues: {
            ":phone": phoneNumber
        }
    };

    console.log("send QUERY request");
    var result = await dynamodb.query(params).promise();
    console.log("QUERY request completed");
    return result;
}
const updateListenerVerificationCode = async (phoneNumber, verificationCode, expireDate) => {
    console.log(`preparing update params for listener ${phoneNumber}`);
    const updateExpression = "set code=:code, isActive= :isActive, expiresAt = :expiresAt";
    const expressionAttributeValues = {
        ":code": verificationCode,
        ":isActive": false,//TODO: remove it, not used
        ":expiresAt": expireDate,//TODO: remove it, not used
    };

    await updateListenerItem(phoneNumber, updateExpression, expressionAttributeValues);
}

const deleteItem = async (phone) => {
    console.log("set DELETE request params");
    let params = {
        Key: {
            "phone": phone
        },
        TableName: table
    };
    console.log("send DELETE request");
    await dynamodb.delete(params).promise();
    console.log("DELETE request completed")
}


exports.getListenerByPhone = getListenerByPhone;
exports.deleteItem = deleteItem;
exports.getListenerByPhoneNCode = getListenerByPhoneNCode;
exports.updateListenerSubscription = updateListenerSubscription;
exports.updateListenerVerificationCode = updateListenerVerificationCode;