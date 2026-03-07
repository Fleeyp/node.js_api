const db = require("../config/database");

class FilterRepository {

    findOne(table, filters) {

        return new Promise((resolve, reject) => {

            const keys = Object.keys(filters);
            const values = Object.values(filters);

            const conditions = keys.map(key => `${key} = ?`).join(" AND ");

            const query = `SELECT * FROM ${table} WHERE ${conditions} LIMIT 1`;

            db.get(query, values, (err, row) => {

                if (err) return reject(err);

                resolve(row);

            });

        });

    }

    findAll(table, filters = null) {

        return new Promise((resolve, reject) => {

            let query = `SELECT * FROM ${table}`;
            let values = [];

            if (filters) {

                const keys = Object.keys(filters);

                const conditions = keys.map(key => `${key} = ?`).join(" AND ");

                values = Object.values(filters);

                query += ` WHERE ${conditions}`;
            }

            db.all(query, values, (err, rows) => {

                if (err) return reject(err);

                resolve(rows);

            });

        });

    }

    insert(table, data) {

        return new Promise((resolve, reject) => {

            const keys = Object.keys(data);
            const values = Object.values(data);

            const placeholders = keys.map(() => "?").join(",");

            const query = `
                INSERT INTO ${table} (${keys.join(",")})
                VALUES (${placeholders})
            `;

            db.run(query, values, function (err) {

                if (err) return reject(err);

                resolve(this);

            });

        });

    }

    update(table, data, filters) {

        return new Promise((resolve, reject) => {

            const dataKeys = Object.keys(data);
            const dataValues = Object.values(data);

            const filterKeys = Object.keys(filters);
            const filterValues = Object.values(filters);

            const setClause = dataKeys.map(key => `${key} = ?`).join(",");

            const whereClause = filterKeys.map(key => `${key} = ?`).join(" AND ");

            const query = `
                UPDATE ${table}
                SET ${setClause}
                WHERE ${whereClause}
            `;

            db.run(
                query,
                [...dataValues, ...filterValues],
                function (err) {

                    if (err) return reject(err);

                    resolve(this);

                }
            );

        });

    }

    delete(table, filters) {

        return new Promise((resolve, reject) => {

            const keys = Object.keys(filters);
            const values = Object.values(filters);

            const whereClause = keys.map(key => `${key} = ?`).join(" AND ");

            const query = `
                DELETE FROM ${table}
                WHERE ${whereClause}
            `;

            db.run(query, values, function (err) {

                if (err) return reject(err);

                resolve(this);

            });

        });

    }

}

module.exports = new FilterRepository();