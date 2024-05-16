process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const { resetData } = require('../test-data')



beforeEach(async function(){
    await resetData();
})


describe("GET /", function() {
    test("Get a list of companies", async function() {
        const response = await request(app).get(`/companies`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            "companies": [
              {code: "apple", name: "Apple Computer"},
              {code: "ibm", name: "IBM"},
            ]
          });
    })
})

describe("GET /:code",function() {
    test("Get the company base on the code", async function() {
        const response = await request(app).get(`/companies/apple`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            "company":{
                code: "apple", 
                name: "Apple Computer",
                description: 'Maker of OSX.',
                industries:[
                    "Accounting",
			        "Human Resource",
			        "Information Technology"
		        ],
                invoices:[expect.any(Number),expect.any(Number),expect.any(Number)]
            }      
        })
    })

    test("Should throw error if code not found", async function() {
        const response = await request(app).get(`/companies/google`);
        expect(response.statusCode).toBe(404);
        expect(response.body.error.message).toEqual('Company Not Found')
    })
})

describe("POST /", function(){
    test("Add a company", async function(){
        const response = await request(app).post(`/companies`).send({
            // code:"google",
            name:"Google",
            description:"Search engine"
        });
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            company:{
                code:"google",
                name:"Google",
                description:"Search engine"
            }
        })
    })
})

describe("PATCH /:code", function(){
    test("Update a company", async function(){
        const response = await request(app).put(`/companies/apple`).send({ 
            "name":"apple",
            "description":"Cool products!"
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            company:{
                code:"apple",
                description:"Cool products!",
                name:"apple",
            }
            
        })
    })
    test("Update a company that doesn't exit", async function(){
        const response = await request(app).put('/companies/microsoft').send({
            name:"msft",
            description:"Software company"
        });
        expect(response.statusCode).toBe(404);
        expect(response.body.error.message).toEqual('Company Not Found');
    })
})

describe('DELETE /:code', function(){
    test("Deleting a company", async function() {
        const response = await request(app).delete(`/companies/apple`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({"status":"deleted"})
    })
    test('Throw an error if code not found', async function() {
        const response = await request(app).delete('/companies/tesla');
        expect(response.statusCode).toBe(404);
        expect(response.body.error.message).toEqual("Company Not Found")
    })
})

afterAll(async function(){
    await db.end()
})