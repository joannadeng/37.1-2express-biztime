const db = require("./db")

async function resetData(){
    await db.query("DELETE FROM companies_industries");
    await db.query("DELETE FROM invoices");
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM industries");
    await db.query("SELECT setval('invoices_id_seq', 1, false)");

    await db.query(`INSERT INTO companies
    VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
           ('ibm', 'IBM', 'Big blue.')`);

    await db.query(`INSERT INTO invoices (comp_Code, amt, paid, paid_date)
    VALUES ('apple', 100, false, null),
           ('apple', 200, false, null),
           ('apple', 300, true, '2018-01-01'),
           ('ibm', 400, false, null)`);

    await db.query(`INSERT INTO industries
    VALUES ('acct', 'Accounting'),
           ('hr','Human Resource'),
           ('mrkt','Marketing'),
           ('it','Information Technology'),
           ('r&d','Research and Development')`);

    await db.query(`INSERT INTO companies_industries
    VALUES ('apple','acct'),
           ('apple','hr'),
           ('apple','it'),
           ('ibm','mrkt'),
           ('ibm','it')`);
}

module.exports = { resetData };