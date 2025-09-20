const axios = require('axios');

async function testBackend() {
    try {
        // Test if the server is running
        const response = await axios.get('http://localhost:3000/api/tenders');
        console.log('Backend is running successfully!');
        console.log('Tenders endpoint response:', response.status);

        // Test portals endpoint
        const portalsResponse = await axios.get('http://localhost:3000/api/portals');
        console.log('Portals endpoint response:', portalsResponse.status);

        console.log('All tests passed!');
    } catch (error) {
        console.error('Error testing backend:', error.message);
        console.log('Please make sure the backend server is running on port 3000');
    }
}

testBackend();