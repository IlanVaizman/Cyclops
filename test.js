const { UserFetcher, UserProcessor } = require('./index.js');
const axios = require('axios');
const winston = require('winston');

jest.mock('axios');

jest.mock('winston', () => {
    const winstonMock = {
        info: jest.fn(),
        error: jest.fn(),
    };

    return {
        format: {
            simple: jest.fn(() => ({})),
        },
        createLogger: jest.fn(() => winstonMock),
        transports: {
            Console: jest.fn(),
        },
    };
});


afterEach(() => {
    jest.clearAllMocks();
});

describe('UserFetcher', () => {

    test('fetchUsers should return data from API when request is successful', async () => {
        const mockUsers = [
            { id: 1, name: "Ilan vaizman", email: "ilan@gmail.com", company: { name: "someName" } }
        ]
        
        axios.get.mockResolvedValue({ data: mockUsers , status: 200 });
        const result = await UserFetcher.fetchUsers();
        expect(result).toEqual(mockUsers);
    });

    test('fetchUsers should return empty array from API when there is no users', async () => {
        axios.get.mockResolvedValue({ data: [], status: 200 });
        const result = await UserFetcher.fetchUsers();
        expect(result).toEqual([]);
    });

    test('fetchUsers should return empty array when API request fails', async () => {
        const errorMessage = 'Network Error';
        axios.get.mockRejectedValue(new Error(errorMessage));
        
        const result = await UserFetcher.fetchUsers();
        expect(result).toEqual([]);
    });
});

describe('UserProcessor', () => {

    test('isValidEmail should correctly validate email addresses', () => {
        // Valid emails
        expect(UserProcessor.isValidEmail('test@example.com')).toBe(true);
        expect(UserProcessor.isValidEmail('user.name@domain.co.il')).toBe(true);
        expect(UserProcessor.isValidEmail('user-name@domain.org')).toBe(true);
        
        // Invalid emails
        expect(UserProcessor.isValidEmail('')).toBe(false);
        expect(UserProcessor.isValidEmail('test@')).toBe(false);
        expect(UserProcessor.isValidEmail('test@domain')).toBe(false);
        expect(UserProcessor.isValidEmail('test')).toBe(false);
        expect(UserProcessor.isValidEmail('@domain.com')).toBe(false);
    });


        test("processUsers should log valid and unvalid users", () => {
            const mockUsers = [
                { id: 1, name: "Correct User", email: "correct@gmail.com", company: { name: "someName" } },
                { id: 2, name: "Invalid User", email: "invalid-email", company: { name: "someName" } }
            ];
    
            const logger = winston.createLogger();
    
            UserProcessor.processUsers(mockUsers);
    
            expect(logger.info).toHaveBeenCalledWith(
                expect.stringContaining(`ID: ${mockUsers[0].id}, Name: ${mockUsers[0].name}, Email: ${mockUsers[0].email}, Company: ${mockUsers[0].company.name}`)
            );
    
            expect(logger.error).toHaveBeenCalledWith(
                expect.stringContaining(`Invalid email for user ID ${mockUsers[1].id}: ${mockUsers[1].email}`)
            );
        });
});