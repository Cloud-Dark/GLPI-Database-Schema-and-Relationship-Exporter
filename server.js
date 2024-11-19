const mysql = require('mysql2');
const fs = require('fs');


const connection = mysql.createConnection({
    host: 'your-database-host',
    user: 'your-database-username',
    password: 'your-database-password',
    database: 'your-database-name',
});

const files = {
    tableNames: './table.txt',
    tableStructure: './structure.txt',
    tableDbml: './table_dbdiagram.dbml',
    structureDbml: './structure_dbdiagram.dbml',
    relationText: './relation.txt',
    relationDbml: './relation_dbdiagram.dbml',
};

connection.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
        return;
    }
    console.log('Connected to the database.');

    // Get all tables
    const getTables = () => {
        return new Promise((resolve, reject) => {
            connection.query(
                `SHOW TABLES`,
                (err, results) => {
                    if (err) return reject(err);
                    const tableNames = results.map(row => Object.values(row)[0]);
                    resolve(tableNames);
                }
            );
        });
    };

    // Get table structure
    const getTableStructure = (tableName) => {
        return new Promise((resolve, reject) => {
            connection.query(`DESCRIBE \`${tableName}\``, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    };

    // Write file helper
    const writeToFile = (filePath, content) => {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`File generated: ${filePath}`);
    };

    // Generate all files
    const generateFiles = async () => {
        try {
            const tables = await getTables();

            // 1. table.txt: Table names
            const tableContent = tables.map(table => `- ${table}`).join('\n');
            writeToFile(files.tableNames, tableContent);

            // 2. structure.txt: Table structures
            let structureContent = '';
            for (const table of tables) {
                const structure = await getTableStructure(table);
                structureContent += `- Table: ${table}\n`;
                structure.forEach(column => {
                    structureContent += `  -- ${column.Field} (${column.Type})\n`;
                });
                structureContent += '\n';
            }
            writeToFile(files.tableStructure, structureContent);

            // 3. table.dbml: Table names in dbdiagram format
            const tableDbmlContent = tables.map(table => `Table ${table} {}`).join('\n\n');
            writeToFile(files.tableDbml, tableDbmlContent);

            // 4. structure_dbdiagram.dbml: Table structures in dbdiagram format
            let structureDbmlContent = '';
            for (const table of tables) {
                const structure = await getTableStructure(table);
                structureDbmlContent += `Table ${table} {\n`;
                structure.forEach(column => {
                    const dbmlType = column.Type
                        .replace('unsigned', '')
                        .replace('tinyint', 'boolean')
                        .replace(/\([^)]+\)/, '');
                    const pkTag = column.Key === 'PRI' ? ' [pk]' : '';
                    structureDbmlContent += `  ${column.Field} ${dbmlType}${pkTag}\n`;
                });
                structureDbmlContent += '}\n\n';
            }
            writeToFile(files.structureDbml, structureDbmlContent);

            // 5. relation.txt: Table relationships in plain text
            const relationships = await detectRelationships(tables);
            let relationContent = '';
            for (const table in relationships) {
                relationContent += `// Table: ${table}\n`;
                relationships[table].forEach(rel => {
                    relationContent += `From: ${rel.from} -> To: ${rel.to}\n`;
                });
                relationContent += '\n\n\n\n\n';
            }
            writeToFile(files.relationText, relationContent);

            // 6. relation_dbdiagram.dbml: Table relationships in dbdiagram format
            let relationDbmlContent = '';
            for (const table in relationships) {
                relationships[table].forEach(rel => {
                    const [fromTable, fromColumn] = rel.from.split('.');
                    const [toTable, toColumn] = rel.to.split('.');
                    relationDbmlContent += `Ref: ${fromTable}.${fromColumn} > ${toTable}.${toColumn}\n`;
                });
            }
            writeToFile(files.relationDbml, relationDbmlContent);
        } catch (err) {
            console.error('Error generating files:', err.message);
        } finally {
            connection.end();
        }
    };

    // Detect relationships
    const detectRelationships = async (tables) => {
        const relationships = {};
        const tablesAndColumns = await Promise.all(
            tables.map(async table => ({
                table,
                columns: (await getTableStructure(table)).map(col => col.Field),
            }))
        );

        for (const table of tables) {
            relationships[table] = [];
            const currentTableColumns = tablesAndColumns.find(tc => tc.table === table).columns;

            for (const other of tablesAndColumns) {
                if (table === other.table) continue;

                currentTableColumns.forEach(column => {
                    if (other.columns.includes(column)) {
                        relationships[table].push({
                            from: `${table}.${column}`,
                            to: `${other.table}.${column}`,
                        });
                    }
                });
            }
        }

        return relationships;
    };

    generateFiles();
});
