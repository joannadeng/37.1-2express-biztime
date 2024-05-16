const express = require('express')
const router = new express.Router()
const db = require('../db')
const ExpressError = require('../expressError')

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = mm + '/' + dd + '/' + yyyy;

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
    // please enable the first version to run jest 

    // try{
    //     const results = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *`, [req.body.amt,req.params.id])
    //     if (results.rows.length === 0) {
    //         throw new ExpressError('Invoice Not Found', 404)
    //     }
    //     return res.json({invoice:results.rows[0]})
    // }catch(e){
    //     return next(e)
    // }


    // further study: allow paying of invoices
    try{
        const results = await db.query(`SELECT * FROM INVOICES WHERE id=$1`,[req.params.id])
        if(results.rows.length === 0) {
            throw new ExpressError('Invoice Not Found',404)
        }
        const inv = results.rows[0];
       
        if(inv.paid === false && req.body.paid === true){
            // inv.paid_date = today;
            const result = await db.query(`UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING *`, [req.body.amt, req.body.paid, today, req.params.id]);
            return res.json({invoice:result.rows[0]})
        }else{
            const result  = await db.query(`UPDATE invoices SET amt=$1, paid=$2 WHERE id=$3 RETURNING *`, [req.body.amt,req.body.paid,req.params.id]);
            return res.json({invoice:result.rows[0]})
        }
    }catch(e){
        return next(e)
    }
    
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