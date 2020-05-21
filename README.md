# Viking do Sertao - Episodes subscription

- [ ] APi Gateway
    - [ ] Subscribe using phone number
        - [ ] Validate phone number format
        - [ ] Integrate with DynamoDB table (PutItem) and create new item
    - [ ] Enpoint to receive subscription confirmation code
    - [ ] Enpoint to remove subscription (DeleteItem)
- [ ] Lambda
    - [ ] DynamoDB trigger
        - [ ] Generate unique code and send an SMS message (SNS publish) to confirm subscription
    - [ ] Receive subscription confirmation (API Gatweway). Subscribe phone number to (SNS topic)
    - [ ] Using (CloudWatch events) check podcast rss for new spisodes and publish message to SNS. 


---
# Resources

### DynamoDB
- [PutItem](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#putItem-property)
- [Create, Read, Update, and Delete an Item ](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GettingStarted.NodeJs.03.html#GettingStarted.NodeJs.03.03)

### Api gateway
- [Api Gateway mapping template](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html)

- [API Gateway - DynamoDB proxy](https://aws.amazon.com/blogs/compute/using-amazon-api-gateway-as-a-proxy-for-dynamodb/)
- [Enable CloudWatch log](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html)

### SNS
- [Publish message](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html#publish-property)
- [Setting SMS messaging preferences using the AWS Management Console](https://docs.aws.amazon.com/sns/latest/dg/sms_preferences.html)
`this is just for reference, what you really need to do in order to change yous spend limit rate is described on the video below`
    - [How do I request a spending limit increase for SMS messages in Amazon SNS?](https://www.youtube.com/watch?v=LUW_9WN6QD0)


[//]: # (https://www.youtube.com/watch?v=LUW_9WN6QD0)
[//]: # (https://www.youtube.com/watch?v=5-HdLf_lizI)

