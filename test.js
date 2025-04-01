const { UserFetcher, UserProcessor } = require('./index.js');
const axios = require('axios');

jest.mock('axios');

describe('UserFetcher', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('fetchUsers should return data from API when request is successful', async () => {
        const mockUsers = [
            { id: 1, name: "Ilan vaizman", email: "ilan@gmail.com", company: { name: "someName" } }
        ]
        
        axios.get.mockResolvedValue({ data: mockUsers , status: 200 });
        const result = await UserFetcher.fetchUsers();
        expect(result).toEqual(mockUsers);
    });

    test('fetchUsers should return empty array from API when there is no users', async () => {
        const mockUsers = []
        
        axios.get.mockResolvedValue({ data: mockUsers, status: 200 });
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
        expect(UserProcessor.isValidEmail('test@')).toBe(false);
        expect(UserProcessor.isValidEmail('test@domain')).toBe(false);
        expect(UserProcessor.isValidEmail('test')).toBe(false);
        expect(UserProcessor.isValidEmail('@domain.com')).toBe(false);
        expect(UserProcessor.isValidEmail('')).toBe(false);
    });
});