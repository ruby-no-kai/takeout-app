// Chime SDK polyfill for AWS SDK JS v3 around SigV4
// Overrides DefaultMessagingSession prepareWebSocketUrl() and startConnecting() for ChimeSigV4Null

import DefaultMessagingSession from "amazon-chime-sdk-js/build/messagingsession/DefaultMessagingSession";

export class ChimeV4MessagingSession extends DefaultMessagingSession {
  async prepareWebSocketUrl2() {
    //console.log("prepareWebSocketUrl2");
    if (this._sigV4Redefined !== true) {
      this.sigV4.signURL = async function (...args) {
        return await this.signURL2(...args);
      }.bind(this.sigV4);
      this._sigV4Redefined = true;
    }
    this._preparedWebSocketUrl = await this.prepareWebSocketUrlOrig();
  }
}

ChimeV4MessagingSession.prototype["startConnectingOrig"] = ChimeV4MessagingSession.prototype["startConnecting"];
ChimeV4MessagingSession.prototype["prepareWebSocketUrlOrig"] = ChimeV4MessagingSession.prototype["prepareWebSocketUrl"];

ChimeV4MessagingSession.prototype["prepareWebSocketUrl"] = function () {
  return this._preparedWebSocketUrl;
};

ChimeV4MessagingSession.prototype["startConnecting"] = async function (reconnecting) {
  //console.log("startConnecting fake");
  try {
    await this.prepareWebSocketUrl2();
    return this.startConnectingOrig(reconnecting);
  } catch (e) {
    console.warn("startConnecting error", e);
  }
};
