const { sendNotificationMessage, subscribe, unsubscribe } = require('./shared/sns');
const { updateListenerVerificationCode, deleteItem, getListenerByPhone, updateListenerSubscription, getListenerByPhoneNCode } = require("./shared/dynamo");

const getExpireDate = () => {
    var currentDate = new Date();
    currentDate.setMinutes(currentDate.getMinutes() + 15);
    return currentDate;
}

const getCode = () => Math.random().toString(36).substr(2, 9);

exports.new_listener_handler = async (event) => {
    let response = {
        statusCode: 200,
        body: 'Wait for a message!',
    };

    console.log(`========= START SUBSCRIPTION FLOW`);
    try {

        for (var i = 0; i < event.Records.length; i++) {
            const record = event.Records[i];
            if (record.eventName === "INSERT") {
                const phone = record.dynamodb.Keys.phone.S
                console.log(`I (${phone}) want to listen to your podcast`);
                const code = getCode();
                console.log(`Use the code "${code}" to confirm you are not a machine`);
                await updateListenerVerificationCode(phone, code, getExpireDate().getTime());

                console.log('trying to send sms');
                await sendNotificationMessage(record.dynamodb.Keys.phone.S, code);
            } else {
                console.log('event != INSERT');
            }
        }

    } catch (e) {
        console.log(e);
        response = {
            statusCode: 400,
            body: 'Oops, contact the support :)...',
        };
    }
    console.log(`========= FINISH SUBSCRIPTION FLOW ${JSON.stringify(response)}`);

    return response;
};



exports.unsubscribe_handler = async (event) => {
    const response = {};
    const { phone } = JSON.parse(event.body);
    console.log(`========= START UNSUBSCRIBE FLOW ${phone}`);
    console.log(`search for phone number: ${phone}`);
    var result = await getListenerByPhone(phone);

    if (result && result.Items.length > 0) {
        console.log('phone number found');
        await unsubscribe(result.Items[0].subscription);
        await deleteItem(result.Items[0].phone)
        response.statusCode = 301;
        response.headers = {
            Location: 'https://google.com',
        }
    } else {
        console.log("item not found");
        response.statusCode = 404;
        response.body = "Phone number not found"
    }

    console.log(`========= FINISH UNSUBSCRIBE FLOW: ${JSON.stringify(response)}`);

    return response;
};


exports.confirm_subscription_handler = async (event) => {
    const response = {};
    const { phone, code } = event.queryStringParameters;
    console.log(`========= START CONFIRMATION FLOW ${phone} and ${code}`);
    var result = await getListenerByPhoneNCode(phone, code);
    if (result && result.Items.length > 0) {
        console.log('phone number found');
        let subscriptionArn = await subscribe(result.Items[0].phone);
        await updateListenerSubscription(result.Items[0].phone, subscriptionArn);
        response.statusCode = 301;
        response.headers = {
            Location: 'https://google.com',
        };
    } else {
        console.log("item not found");
        response.statusCode = 404;
        response.body = "Phone number not found";
    }

    console.log(`========= FINISH CONFIRMATION FLOW ${JSON.stringify(response)}`);

    return response;
};

exports.handler = async (event) => {
    const response = {};
    return response;
};
