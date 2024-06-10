const sqlite3 = require("sqlite3");

const formatData = require("../cardapio/formatData");

// Connect to the SQLite database
const sqliteDB = new sqlite3.Database("DB/RU.db");

// Serialize all queries to the database
sqliteDB.serialize(() => {
    // Create the cardapio table if it does not exist
    sqliteDB.run(`CREATE TABLE IF NOT EXISTS cardapio (
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
async function insertIntoDB(newCardapioSemana, next) {
    // sqliteDB.run(`DELETE FROM cardapio`);
    try {
        await formatData(newCardapioSemana, async (cardapios) => {
            // Prepare a parameterized statement for efficient bulk insertion
            await new Promise((resolve, reject) => {
                sqliteDB.run('BEGIN TRANSACTION', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            const stmt = sqliteDB.prepare(`
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
            sqliteDB.run('COMMIT TRANSACTION', (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log("Cardápio inserido com sucesso");
                    resolve();
                }
            });
        });
        return next(true);
    } catch (err) {
        console.log(err);
        console.log("Erro ao inserir cardápio");
        // Handle the error, for example, rollback the transaction (if possible).
        await new Promise((resolve, reject) => {
            sqliteDB.run('ROLLBACK TRANSACTION', (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
        return next(false);
    }

}

/**
 * Retrieves all cardápio (menu) data from the SQLite database and invokes a callback function.
 * 
 * @async
 * @returns {Promise<void>} - A promise that resolves when the cardápio data is retrieved.
 */
async function getAllCardapioFromSQLite() {
    sqliteDB.all("SELECT * FROM cardapio", (err, rows) => {
        if (err) {
            console.error(err);
            return [];
        } else {
            console.log(rows);
            return rows;
        }
    });
}

/**
 * Finds a cardápio (menu) by date and invokes a callback function with the result.
 * 
 * @async
 * @param {string} data - The date to search for.
 * @returns {Promise<void>} - A promise that resolves with the found cardápio.
 */
async function findOneByDate(date, next) {
    // Execute a SQL query to find a cardápio by date
    // The SQL query selects all columns from the cardapio table where the data column matches the given date
    // The result is then passed to the callback function
    sqliteDB.all(`SELECT * FROM cardapio WHERE data = '${date}'`, (err, rows) => {
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

/**
 * Finds a cardápio (menu) by date and updates the cardápio data with the given dados.
 * 
 * @async
 * @param {string} date - The date to search for.
 * @param {Object} dados - The cardápio data to update.
 * @returns {Promise<void>} - A promise that resolves when the cardápio data is updated.
 */
async function findAndUpdate(date, dado) {
    // Get the cardápio data for the given date
    try{

        const dados = dado[0];
        // Begin a transaction
        await new Promise((resolve, reject) => {
            sqliteDB.run('BEGIN TRANSACTION', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    
        // Execute a SQL query to find a cardápio by date and update its data
        // The SQL query updates all columns from the cardapio table where the data column matches the given date
        // The result is then passed to the callback function
        sqliteDB.run(`UPDATE cardapio 
            SET almoco_nomeDaRefei = '${dados.almoco_nomeDaRefei}',
            almoco_amo1 = '${dados.almoco_amo1}',
            almoco_amo2 = '${dados.almoco_amo2}',
            almoco_amo3 = '${dados.almoco_amo3}',
            almoco_amo4 = '${dados.almoco_amo4}',
            almoco_amo5 = '${dados.almoco_amo5}',
            almoco_vegetariano = '${dados.almoco_vegetariano}',
            jantar_nomeDaRefei = '${dados.jantar_nomeDaRefei}',
            jantar_jan1 = '${dados.jantar_jan1}',
            jantar_jan2 = '${dados.jantar_jan2}',
            jantar_jan3 = '${dados.jantar_jan3}',
            jantar_jan4 = '${dados.jantar_jan4}',
            jantar_jan5 = '${dados.jantar_jan5}',
            jantar_vegetariano = '${dados.jantar_vegetariano}'
            WHERE data = '${date}'`, (err, rows) => {
            if (err) {
                console.error(err);
                return;
            } else {
                console.log("Cardápio inserido com sucesso");
            }
        });
    
        // Commit the transaction
        await new Promise((resolve, reject) => {
            sqliteDB.run('COMMIT TRANSACTION', (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    
        return true;
    }catch(err){
        console.log(err);
        await new Promise((resolve, reject) => {
            sqliteDB.run('ROLLBACK TRANSACTION', (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
        return false;
    }
}

module.exports = { insertIntoDB, getAllCardapioFromSQLite, findOneByDate, findAndUpdate };
