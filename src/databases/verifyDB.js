const sqlite3 = require("sqlite3");

const formatData = require("../cardapio/formatData");

// Connect to the SQLite database
const varidateDB = new sqlite3.Database("DB/verify.db");

// Serialize all queries to the database

varidateDB.serialize(() => {
    // Create the cardapio table if it does not exist
    varidateDB.run(`CREATE TABLE IF NOT EXISTS cardapio (
        dia TEXT NOT NULL,
        data TEXT NOT NULL UNIQUE,
        almoco_nomeDaRefei TEXT,
        almoco_amo1 TEXT,
        almoco_amo2 TEXT,
        almoco_amo3 TEXT,
        almoco_amo4 TEXT,
        almoco_amo5 TEXT,
        almoco_vegetariano TEXT,
        jantar_nomeDaRefei TEXT,
        jantar_jan1 TEXT,
        jantar_jan2 TEXT,
        jantar_jan3 TEXT,
        jantar_jan4 TEXT,
        jantar_jan5 TEXT,
        jantar_vegetariano TEXT
    )`);
});


/**
 * Inserts the cardápio (menu) data into the SQLite database.
 * 
 * @param {Object} newCardapioSemana - The cardápio data to be inserted.
 * @returns {Promise<void>} - A promise that resolves when the cardápio data is inserted.
 */
async function insertIntoVerifyDB(newCardapioSemana, next) {
    varidateDB.run(`DELETE FROM cardapio`);

    try {
        await formatData(newCardapioSemana, async (cardapios) => {
            // Prepare a parameterized statement for efficient bulk insertion
            await new Promise((resolve, reject) => {
                varidateDB.run('BEGIN TRANSACTION', (err) => {
                  if (err) reject(err);
                  else resolve();
                });
              });

            const stmt = varidateDB.prepare(`
                INSERT INTO cardapio (dia, data, almoco_nomeDaRefei, almoco_amo1, almoco_amo2, almoco_amo3, almoco_amo4, almoco_amo5, almoco_vegetariano, jantar_nomeDaRefei, jantar_jan1, jantar_jan2, jantar_jan3, jantar_jan4, jantar_jan5, jantar_vegetariano)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `);

            // Insert multiple rows using the prepared statement
            await new Promise((resolve, reject) => {
                cardapios.forEach(value => {
                    stmt.run(value, (err) => {
                        if (err) {
                            reject(err);
                        } else {

                            resolve();
                        }
                    });
                })
            });

            stmt.finalize();
        });

        // Commit the transaction
        await new Promise((resolve, reject) => {
            varidateDB.run('COMMIT TRANSACTION', (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        return next(true);

    } catch (error) {
        console.log(error);
        return false;
    }
}


/**
 * Retrieves all cardápio (menu) data from the SQLite database and returns it.
 * 
 * @async
 * @returns {Promise<Array>} - A promise that resolves with an array of cardápio objects.
 *  If an error occurs, an empty array is returned and the error is logged.
 */
async function getAllVerifyData(next) {

    varidateDB.all("SELECT * FROM cardapio", (err, rows) => {
        if (err) {
            console.error(err);
            return [];
        } else {
            return next(rows)
        }
    });
}

/**
 * Finds a cardápio (menu) by date and invokes a callback function with the result.
 * 
 * @async
 * @param {string} data - The date to search for.
 * @param {Function} next - The callback function.
 * @returns {Promise<void>} - A promise that resolves with the found cardápio.
 */
async function findOneByDateInVerifyDB(date, next) {
    varidateDB.all(`SELECT * FROM cardapio WHERE data = '${date}'`, (err, rows) => {
        if (err) {
            // If an error occurs, log the error and invoke the callback with the error
            console.error(err);
            return [];
        } else {
            // Invoke the callback with the result
            return next(rows);
        }
    });
}

// Export the database object
/**
 * The SQLite database object.
 */
module.exports = { insertIntoVerifyDB, getAllVerifyData, findOneByDateInVerifyDB };
