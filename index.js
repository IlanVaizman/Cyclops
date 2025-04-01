const axios = require('axios');
const winston = require('winston');


const logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'index.log' }) 
    ],
});

class UserFetcher {
    static get API_URL() {
        return 'https://jsonplaceholder.typicode.com/users';
    }

    static async fetchUsers() {
        logger.info("Fetching users...");

        try {
            const response = await axios.get(UserFetcher.API_URL);
            logger.info(`Fetch status: ${response.status} - Successfully fetched ${response.data.length} users`);
            return response.data;
        } catch (error) {
            logger.error(`Failed to fetch users: ${error.message}`);
            return [];
        }
    }
}

class UserProcessor {
    static get EMAIL_REGEX() {
        return /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/;
    }

    static isValidEmail(email) {
        return UserProcessor.EMAIL_REGEX.test(email);
    }

    static processUsers(users) {
        users.forEach(user => {
            const { id, name, email, company: { name: companyName } } = user;

            if (UserProcessor.isValidEmail(email)) {
                logger.info(`ID: ${id}, Name: ${name}, Email: ${email}, Company: ${companyName}`);
            } else {
                logger.error(`Invalid email for user ID ${id}: ${email}`);
            }
        });
    }
}

async function main() {    
    const users = await UserFetcher.fetchUsers();
    
    if (users.length) {
        UserProcessor.processUsers(users);
    }
}

module.exports = {
    UserFetcher,
    UserProcessor
};

main();
