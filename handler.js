'use strict';

const crypto = require('crypto');
const postgresClient = require('./connections/PostgresConnection')('production');

postgresClient.authenticate()
.then(() => console.log('Database Connected Successfully'))
.catch((err) => console.log(`Database Connection Failed! ERR: ${err}`));

module.exports.app = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        const Controller = require('./controller')(postgresClient);
        const clientProfileController = Controller.clientProfileController;
        const MagicWord = process.env.MAGIC_WORD;

        const clientEmail = event.body.client_email;
        const clientBio = event.body.client_bio;

        const clientEmailSalted = clientEmail + "" + MagicWord;
        const clientId = crypto.createHash('sha256').update(clientEmailSalted).digest('base64');

        await clientProfileController.updateClientBio(clientId, clientBio);
     
        const response = {
            MESSAGE: 'DONE',
            RESPONSE: 'Client Bio Updated Successfully!',
            CODE: 'CLIENT_UPDATED_SUCCESSFULLY'
        };

        return {
            statusCode: 200,
            body: JSON.stringify(response)
        };

    } catch(err) {
        console.error(`ERR: ${JSON.stringify(err.message)}`);

        const response = {
            ERR: err.message,
            RESPONSE: 'Client Bio Upload Failed!',
            CODE: 'CLIENT_UPDATION_FAILED'
        };

        return {
            statusCode: 400,
            body: JSON.stringify(response)
        };
    }
}