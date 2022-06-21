const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");
const serviceAccount = require("./credentials.json");

const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://game-queue-97ad4-default-rtdb.firebaseio.com"
});

getAuth(app)
    .setCustomUserClaims('kMQBKq79FthB5RAQpBkp0vlv8Fq1', { admin: true })
    .then(() => {
        console.log('Successfully set admins');
    });
