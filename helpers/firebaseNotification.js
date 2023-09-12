var admin = require("firebase-admin");

 var serviceAccount = require("../config/creds.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Create a list containing up to 500 registration tokens.
// These registration tokens come from the client FCM SDKs.

function send_notification(title, body, data, user_tokens) {
  const registrationTokens = user_tokens;
  const Messaging = admin.messaging();
  const message = {
    notification: {
      title: title,
      body: body,
    },
    data: data,
    tokens: registrationTokens,
  };
  // console.log(message);
  Messaging.sendMulticast(message)
    .then((response) => {
      // console.log(response.successCount + " messages were sent successfully");
      return response;
    })
    .catch((err) => {
      console.log(err);
      return err;
    });
}
exports.send_notification = send_notification;
