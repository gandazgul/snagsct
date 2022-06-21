const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('./credentials.json');

const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://game-queue-97ad4-default-rtdb.firebaseio.com',
});

const auth = getAuth(app);

const admins = [
    'kMQBKq79FthB5RAQpBkp0vlv8Fq1', // Carlos
];
const promises = [];

for (const uid of admins) {
    promises.push(
        auth.setCustomUserClaims('kMQBKq79FthB5RAQpBkp0vlv8Fq1', { admin: true }),
    );
}

Promise.all(promises)
       .then(() => {
           console.log('Successfully set admins');
       });
