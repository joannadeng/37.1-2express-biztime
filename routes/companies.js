const express = require('express')
const router = new express.Router()
const db = require('../db')
const ExpressError = require('../expressError')

router.get('/', async function(req,res,next) {
    try{
        const results = await db.query(`SELECT code,name FROM companies`);
        return res.json({companies:results.rows})
    }catch(e){
        return next(e)
    }
})

router.get('/:code',async function(req,res,next) {
    try{
        const comResults = await db.query(` SELECT * FROM companies WHERE code=$1`, [req.params.code])
        if (comResults.rows.length === 0) {
            throw new ExpressError('Company Not Found', 404)
        }
        const invResults = await db.query(`
            SELECT id FROM invoices 
            WHERE comp_code=$1`,[req.params.code])
        const { code, name, description } = comResults.rows[0];
        const company = { code, name, description };
        company.invoices = invResults.rows.map(inv => inv.id);
        return res.json({company:company})
    }catch(e){
        return next(e)
    }

    // try{
    //     const comResults = await db.query(`
    //     SELECT c.code, c.name, c.description, i.industry
    //     FROM companies AS c
    //     LEFT JOIN companies_industries AS ci
    //     ON c.code=ci.comp_code
    //     LEFT JOIN industries AS i
    //     ON ci.indy_code=i.code
    //     WHERE c.code=$1`,[req.params.code]);

    //     const invResults = await db.query(`
    //     SELECT id FROM invoices 
    //     WHERE comp_code=$1`,[req.params.code])
    //     const { code, name, description } = comResults.rows[0];
    //     const company = { code, name, description };
    //     if(comResults.rows.length === 0){
    //         throw new ExpressError("Company Not Found",404)
    //     }
    //     const invoices = invResults.rows;
    //     company.industries = comResults.rows.map( r => r.industry);
    //     company.invoices = invoices.map(inv => inv.id)
    //     return res.json({company:company})
    //     return res.send(comResults)
    // }catch(e){
    //     console.log(e)
    //     return next(e)
    // }
})


router.post('/',async function(req,res,next) {
    try{
        const{code,name,description} = req.body;
        if(!code || !name || !description) {
            throw new ExpressError('Missing required data', 400) 
        }
        const results = await db.query(`INSERT INTO companies (code,name,description)  VALUES($1,$2,$3) RETURNING code,name,description`, [code,name,description])
        return res.status(201).json({company:results.rows[0]})
    }catch(e){
        return next(e)
    }    
})

router.put('/:code',async function(req,res,next) {
    try{
    const{name, description} = req.body;
    if(!name || !description) {
        throw new ExpressError('Missing require data', 400)
    }
    const results = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`, [name,description,req.params.code])
    if(results.rows.length === 0){
        throw new ExpressError('Company Not Found', 404)
    }
    return res.json({company:results.rows[0]})
    }catch(e){
        return next(e)
    }
})

router.delete('/:code', async function(req,res,next) {
    try{
        const results = await db.query(`DELETE FROM companies WHERE code=$1 RETURNING code`, [req.params.code])
        if (results.rows.length === 0) {
        throw new ExpressError('Company Not Found', 404)  
        }
        return res.send({status:"deleted"})
    }catch(e){
        return next(e)
    }
    
})

module.exports = router;