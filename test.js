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

const logger = winston.createLogger();

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

    test('fetchUsers should throw error when API response is invalid', async () => {
        const errorMessage = 'Failed to fetch users: Invalid API response: Expected an array of users';

        axios.get.mockResolvedValue({ status: 200 });  // No data property in the response
        await expect(UserFetcher.fetchUsers()).rejects.toThrow(errorMessage);

        axios.get.mockResolvedValue({ status: 404 });
        await expect(UserFetcher.fetchUsers()).rejects.toThrow(errorMessage);

        const invalidInputs = ['dasdsad', 321321, true, false, null, undefined, {}];
        invalidInputs.forEach(input => {
            axios.get.mockResolvedValue({ status: 200, data: input });
            expect(() => UserFetcher.fetchUsers()).rejects.toThrow(errorMessage);
         });
    });

    test('fetchUsers should throw an error when the API request fails', async () => {
        const errorMessage = 'Network Error';
        axios.get.mockRejectedValue(new Error(errorMessage));
        
        await expect(UserFetcher.fetchUsers()).rejects.toThrow(`Failed to fetch users: ${errorMessage}`);
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
        expect(UserProcessor.isValidEmail('test@ domain.com')).toBe(false);
        expect(UserProcessor.isValidEmail('test @domain.com')).toBe(false);
        expect(UserProcessor.isValidEmail('test@domain..com')).toBe(false);
        expect(UserProcessor.isValidEmail('test@domain.com..il')).toBe(false);
        expect(UserProcessor.isValidEmail('test@domain..com..il')).toBe(false);

    });


    test("processUsers should log valid and unvalid users", () => {
        const mockUsers = [
            { id: 1, name: "Correct User", email: "correct@gmail.com", company: { name: "someName" } },
            { id: 2, name: "Invalid User", email: "invalid-email", company: { name: "someName" } }
        ];
        
        UserProcessor.processUsers(mockUsers);
    
        expect(logger.info).toHaveBeenCalledWith(
            expect.stringContaining(`ID: ${mockUsers[0].id}, Name: ${mockUsers[0].name}, Email: ${mockUsers[0].email}, Company: ${mockUsers[0].company.name}`)
        );
    
        expect(logger.error).toHaveBeenCalledWith(
            expect.stringContaining(`Invalid email for user ID ${mockUsers[1].id}: ${mockUsers[1].email}`)
        );
    });

    test('processUsers should throw an error when given invalid input types', () => {    
        const invalidInputs = ['dasdsad', 321321, true, false, null, undefined, {}, []];

        invalidInputs.forEach(input => {
           expect(() => UserProcessor.processUsers(input)).toThrow(
            "Invalid input: users must be an array and cannot be empty"
           );
        });
    });
});