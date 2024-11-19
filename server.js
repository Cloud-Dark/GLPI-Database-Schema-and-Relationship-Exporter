const mysql = require('mysql2');
const fs = require('fs');

const connection = mysql.createConnection({
    host: 'your-database-host',
    user: 'your-database-username',
    password: 'your-database-password',
    database: 'your-database-name',
});

// Output file paths
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

    // Get all tables and columns for relationships
    const getTablesAndColumns = () => {
        return new Promise((resolve, reject) => {
            connection.query(
                `SELECT TABLE_NAME, COLUMN_NAME 
                 FROM INFORMATION_SCHEMA.COLUMNS 
                 WHERE TABLE_SCHEMA = 'glpi'`,
                (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                }
            );
        });
    };

    // Detect relationships
    const detectRelationships = async () => {
        const tablesAndColumns = await getTablesAndColumns();
        const relationships = [];

        for (let i = 0; i < tablesAndColumns.length; i++) {
            const from = tablesAndColumns[i];
            for (let j = 0; j < tablesAndColumns.length; j++) {
                const to = tablesAndColumns[j];

                // Skip self-joins
                if (from.TABLE_NAME === to.TABLE_NAME) continue;

                // Check for potential relationships (e.g., matching column names)
                if (from.COLUMN_NAME === to.COLUMN_NAME || from.COLUMN_NAME.endsWith(`_${to.COLUMN_NAME}`)) {
                    relationships.push({
                        from: `${from.TABLE_NAME}.${from.COLUMN_NAME}`,
                        to: `${to.TABLE_NAME}.${to.COLUMN_NAME}`
                    });
                }
            }
        }

        return relationships;
    };

    // Generate and export all files
    const generateFiles = async () => {
        try {
            const tables = await getTables();

            // 1. table.txt: Table names
            const tableContent = tables.map(table => `- ${table}`).join('\n');
            fs.writeFileSync(files.tableNames, tableContent, 'utf8');
            console.log(`File generated: ${files.tableNames}`);

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
            fs.writeFileSync(files.tableStructure, structureContent, 'utf8');
            console.log(`File generated: ${files.tableStructure}`);

            // 3. table_dbdiagram.dbml: Table names in dbdiagram format
            const tableDbmlContent = tables.map(table => `Table ${table} {}`).join('\n\n');
            fs.writeFileSync(files.tableDbml, tableDbmlContent, 'utf8');
            console.log(`File generated: ${files.tableDbml}`);

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
            fs.writeFileSync(files.structureDbml, structureDbmlContent, 'utf8');
            console.log(`File generated: ${files.structureDbml}`);

            // 5. relation.txt: Relationships in plain text
            const relationships = await detectRelationships();
            let relationContent = '';
            const grouped = {};
            relationships.forEach(rel => {
                const [fromTable] = rel.from.split('.');
                if (!grouped[fromTable]) grouped[fromTable] = [];
                grouped[fromTable].push(`From: ${rel.from} -> To: ${rel.to}`);
            });
            for (const table in grouped) {
                relationContent += `// Table: ${table}\n`;
                relationContent += grouped[table].join('\n') + '\n\n\n\n\n';
            }
            fs.writeFileSync(files.relationText, relationContent, 'utf8');
            console.log(`File generated: ${files.relationText}`);

            // 6. relation_dbdiagram.dbml: Relationships in dbdiagram format
            let relationDbmlContent = '';
            relationships.forEach(rel => {
                const [fromTable, fromColumn] = rel.from.split('.');
                const [toTable, toColumn] = rel.to.split('.');
                relationDbmlContent += `Ref: ${fromTable}.${fromColumn} > ${toTable}.${toColumn}\n`;
            });
            fs.writeFileSync(files.relationDbml, relationDbmlContent, 'utf8');
            console.log(`File generated: ${files.relationDbml}`);
        } catch (err) {
            console.error('Error generating files:', err.message);
        } finally {
            connection.end();
        }
    };

    generateFiles();
});
