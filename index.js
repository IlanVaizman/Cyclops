const axios = require('axios');
const winston = require('winston');


const logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [
        new winston.transports.Console(),
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
            
            if (!response.data || !Array.isArray(response.data)) {
                throw new Error("Invalid API response: Expected an array of users");
            }
            
            logger.info(`Fetch status: ${response.status} - Successfully fetched ${response.data.length} users`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch users: ${error.message}`);
        }
    }
}

class UserProcessor {
    static get EMAIL_REGEX() {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    }

    static isValidEmail(email) {
        return UserProcessor.EMAIL_REGEX.test(email);
    }

    static processUsers(users) {
        if (!Array.isArray(users) || users.length === 0) {
            throw new Error("Invalid input: users must be an array and cannot be empty");
        }

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
    } else {
        logger.warn("No users found to process.");
    }
}

module.exports = {
    UserFetcher,
    UserProcessor
};

if (require.main === module) {
    main();
}
