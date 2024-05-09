const express = require('express')
const router = new express.Router()
const db = require('../db')
const ExpressError = require('../expressError')

router.get('/', async function(req, res, next) {
    try{
        const results = await db.query(`SELECT id, comp_code FROM invoices`)
        return res.json({invoices:results.rows})
    }catch(e){
        next(e)
    }
})

router.get('/:id', async function(req, res, next) {
    try{
        const results = await db.query(`
        SELECT * FROM invoices AS i
        left JOIN companies AS c
        ON i.comp_code = c.code
        WHERE i.id=$1`,[req.params.id]);
        if(results.rows.length === 0) {
            throw new ExpressError(`Invoice Not Found`, 404)
        }
        let inv;
        const {id,comp_code,amt,paid,add_date,paid_date} = results.rows[0];
        const {code, name, description} = results.rows[0]
        inv = {id,comp_code,amt,paid,add_date,paid_date}
        inv.company = {code,name,description}
        return res.send({invoice:inv})  
    }catch(e){
        return next(e)
    }
})

router.post('/',async function(req,res,next) {
    try{
        if(! req.body.comp_code || ! req.body.amt) {
            throw new ExpressError('Missing required data', 400)
        }
        const results = await db.query(`INSERT INTO invoices(comp_code, amt) VALUES($1,$2) RETURNING *`, [req.body.comp_code, req.body.amt]);
        return res.status(201).json({invoice:results.rows[0]})
    }catch(e){
        return next(e)
    }
})

router.patch('/:id', async function(req,res,next) {
    try{
        const results = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *`, [req.body.amt,req.params.id])
        if (results.rows.length === 0) {
            throw new ExpressError('Invoice Not Found', 404)
        }
        return res.json({invoice:results.rows[0]})
    }catch(e){
        return next(e)
    }

    // Allow paying of invoices
})

router.delete('/:id', async function(req,res,next) {
    try{
        const results = await db.query(`DELETE FROM invoices WHERE id=$1 RETURNING id`,[req.params.id])
        if (results.rows.length === 0){
           throw new ExpressError('Invoice Not Found',404) 
        }
        return res.send({status:"Deleted"})
    }catch(e){
        return next(e)
    }
})

module.exports = router;