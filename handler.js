"use strict";
const AWS = require("aws-sdk");

module.exports.handler = (event, context, callback) => {
  createSocket(event, callback);
};

const createSocket = async (event, callback) => {
  try {
    if (event.requestContext) {
      const { connectionId, routeKey, domainName, stage } =
        event.requestContext;

      switch (routeKey) {
        case "$connect":
          break;

        case "$disconnect":
          break;

        default:
          const callbackUrlForAWS = `https://${domainName}/${stage}`;
          sendMessageToClient(callbackUrlForAWS, connectionId, {
            connectionId: connectionId,
            callbackUrlForAWS: callbackUrlForAWS,
          });
          break;
      }
    }

    callback(null, {
      statusCode: 200,
    });
  } catch (error) {
    console.log("ERROR==>", error);
    callback(null, {
      statusCode: 500,
    });
  }
};

const sendMessageToClient = (url, connectionId, payload) =>
  new Promise((resolve, reject) => {
    const apiGatewayManagementApi = new AWS.ApiGatewayManagementApi({
      apiVersion: "2018-11-29",
      endpoint: url,
    });
    apiGatewayManagementApi.postToConnection(
      {
        ConnectionId: connectionId,
        Data: JSON.stringify(payload),
      },
      (err, data) => {
        if (err) {
          console.log("sendMessageToClient ERROR==>", err);
          reject(err);
        }
        resolve(data);
      }
    );
  });