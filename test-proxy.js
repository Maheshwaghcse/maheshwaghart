const fs = require('fs');

async function test() {
  try {
    const FormData = require('form-data'); // Not installed, I should construct multipart manually or use a mock.
    // wait, I don't need to use form-data, I can just use a fake body to see if it reaches the backend.
  } catch (e) {
  }
}
test();
