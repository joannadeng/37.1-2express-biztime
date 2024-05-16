process.env.NODE_ENV = "test";

const request = require("supertest")
const app = require("../app")
const db = require("../db")
const {resetData} = require("../test-data")

beforeEach(async function(){
    await resetData();
})

describe("GET /", function(){
    test("Get a list of invoices", async function(){
        const response = await request(app).get(`/invoices`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            invoices: [
                { id: expect.any(Number), comp_code: 'apple' },
                { id: expect.any(Number), comp_code: 'apple' },
                { id: expect.any(Number), comp_code: 'apple' },
                { id: expect.any(Number), comp_code: 'ibm' }
              ]
        })
    })
})

describe('GET /:id', function(){
    test("Get invoices base on id", async function(){
        const response = await request(app).get(`/invoices`);
        const inv = response.body.invoices[0]
        const res = await request(app).get(`/invoices/${inv.id}`);
        expect(res.statusCode).toBe(200);
    })

    test('Should return an error if id not found', async function(){
        const response = await request(app).get(`/invoices/444`);
        expect(response.statusCode).toBe(404);
        expect(response.body.error.message).toEqual(`Invoice Not Found`)
    })
})

describe('POST /', function(){
    test('make an invoice', async function(){
        const response = await request(app).post(`/invoices`).send({
            comp_code:"apple",
            amt:500
        })
        expect(response.statusCode).toBe(201)
    })

    test('Should throw an error if missing required data', async function() {
        const response = await request(app).post(`/invoices`).send({
            comp_code:"apple"
        })
        expect(response.statusCode).toBe(400),
        expect(response.body.error.message).toEqual('Missing required data')
    })
})

describe(`PATCH /:id`, function(){
    test("Update an invoice base on id", async function(){
        const response = await request(app).get(`/invoices`);
        const inv = response.body.invoices[0];
        const res = await request(app).patch(`/invoices/${inv.id}`).send({
            amt:400,
            paid:false
        });
        expect(res.statusCode).toBe(200);
    })

    test("Should return an error if id not found", async function(){
        const response = await request(app).patch(`/invoices/444`).send({
            amt:500
        });
        expect(response.statusCode).toBe(404);
        expect(response.body.error.message).toEqual(`Invoice Not Found`)
    })
})

describe('DELETE /:id', function(){
    test('Delete an invoice base on id', async function(){
        const response = await request(app).get(`/invoices`);
        const inv = response.body.invoices[1];
        const res = await request(app).delete(`/invoices/${inv.id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({"status":"Deleted"});
    })

    test("Should throw an error if id not found", async function(){
        const res = await request(app).delete(`/invoices/-1`);
        expect(res.statusCode).toBe(404);
        expect(res.body.error.message).toEqual('Invoice Not Found')
    })
})   

afterAll(async function(){
    await db.end();
})