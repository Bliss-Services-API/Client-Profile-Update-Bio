module.exports = postgresClient => {
    const clientProfileModel = require('./ClientProfileModel')(postgresClient);

    return {
        clientProfileModel
    };
}