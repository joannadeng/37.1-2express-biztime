const express = require('express')
const router = new express.Router()
const db = require('../db')
const ExpressError = require('../expressError')
const slugify = require('slugify') 

router.get('/', async function(req,res,next) {
    try{
        const results = await db.query(`
        SELECT i.icode, i.industry, com.code
        FROM industries AS i
        LEFT JOIN companies_industries AS ci
        ON i.icode=ci.indy_code
        LEFT JOIN companies AS com
        ON ci.comp_code=com.code
        `)
        return res.json({industries:results.rows})
    }catch(e){
        console.log(e)
        return next(e)
    }
})

router.get('/:icode', async function(req,res,next) {
    const results = await db.query(`
    SELECT i.icode, i.industry, com.code
        FROM industries AS i
        LEFT JOIN companies_industries AS ci
        ON i.icode=ci.indy_code
        LEFT JOIN companies AS com
        ON ci.comp_code=com.code
    WHERE i.icode=$1
    `,[req.params.icode])
    const {icode,industry} = results.rows[0]
    const companies = results.rows.map(r => r.code)

    return res.json({industry:{icode,industry,companies}})
})

router.post('/', async function(req,res,next) {
    try{
        const {industry} = req.body;
        if(!industry) {
            throw new ExpressError('Missing required data', 404)
        }
        const icode = slugify(industry,{
                replacement:'-',
                lower:true,
                trim:true,
                remove: /[*+~.()'"!:@]/g
        })
        const results = await db.query(`INSERT INTO industries(code,industry) VALUES($1,$2) RETURNING code, industry`, [icode, industry])
        return res.json({industry:results.rows[0]})
    }catch(e){
        return next(e)
    }
})

router.post('/addIndyToCom', async function (req,res,next) {
    try{
        const {comp_code,indy_code} = req.body;

        if(!comp_code || !indy_code){
            throw new ExpressError('Missing required data', 400)
       };
    
       const compRes = await db.query(`SELECT * FROM companies`);
       const compCode = compRes.rows.map(r => r.code);

       const indyRes = await db.query(`SELECT * FROM industries`);
       const indyCode = indyRes.rows.map(r => r.icode);

       if (compCode.includes(comp_code) && indyCode.includes(indy_code)) {
        const result = await db.query(`INSERT INTO companies_industries(comp_code,indy_code) VALUES($1,$2) RETURNING comp_code,indy_code`,[comp_code,indy_code])
        return res.json({newCompIndy:result.rows[0]})
       }else{
        throw new ExpressError('Company or Industry code not exist, please check', 400)
       }

    }catch(e){
        return next(e)
}
})

module.exports = router;