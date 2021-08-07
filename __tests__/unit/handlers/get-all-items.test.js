// Import dynamodb from aws-sdk
const dynamodb = require("aws-sdk/clients/dynamodb");

// Import all functions from get-all-items.js
const lambda = require("../../../src/handlers/get-all-items.js");

// This includes all tests for getAllItemsHandler
describe("Test getAllItemsHandler", () => {
  // This test invokes getAllItemsHandler and compares the result
  it("should return ids", async () => {
    const event = {
      httpMethod: "GET",
    };

    // Invoke getAllItemsHandler
    // await lambda.getAllItemsHandler(event);

    // Compare the result with the expected result
    // expect(result).toEqual(expectedResult);
  });
});
