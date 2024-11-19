# **GLPI Database Schema and Relationship Exporter**

This Node.js project automates the process of exporting table structures and relationships from a GLPI database. The output includes files in both plain text and `dbdiagram.io`-compatible formats, making it easy to visualize and document the database schema.

---

## Features

- **Export Table Names:** A plain text file listing all table names in the GLPI database.
- **Export Table Structures:**
  - Plain text format with column details.
  - DBML format for `dbdiagram.io`.
- **Export Relationships:**
  - Plain text format describing relationships between tables.
  - DBML format for `dbdiagram.io`.

---

## Project Idea: **Simplify GLPI Database Documentation**

The goal of this project is to help GLPI administrators and developers quickly understand and document the database structure. By automating the process of exporting schema and relationships, the project ensures accurate and consistent documentation, aiding in troubleshooting, reporting, and database optimization.

---

## Prerequisites

- Node.js installed on your system.
- A MySQL database with accessible credentials.
- The `mysql2` library installed. To install it, run:
  ```bash
  npm install mysql2
  ```

---

## Setup

1. Clone the repository or copy the script.
2. Update the database credentials in the script:
   ```javascript
   const connection = mysql.createConnection({
       host: 'your-database-host',
       user: 'your-database-username',
       password: 'your-database-password',
       database: 'your-database-name',
   });
   ```

3. Save the script as `generate_files.js`.

---

## Usage

Run the script using Node.js:

```bash
node generate_files.js
```

---

## Generated Files

The script generates the following files in the script directory:

1. **`table.txt`:**
   - Lists all table names in the GLPI database.
   - Format:
     ```
     - glpi_agents
     - glpi_entities
     ```

2. **`structure.txt`:**
   - Describes each table’s structure in plain text.
   - Format:
     ```
     - Table: glpi_agents
       -- id (int unsigned)
       -- deviceid (varchar(255))
     ```

3. **`table.dbml`:**
   - Table names formatted for `dbdiagram.io`.
   - Format:
     ```
     Table glpi_agents {}
     Table glpi_entities {}
     ```

4. **`structure_dbdiagram.dbml`:**
   - Full table structures formatted for `dbdiagram.io`.
   - Format:
     ```
     Table glpi_agents {
       id int [pk]
       deviceid varchar
     }

     Table glpi_entities {
       id int [pk]
       name varchar
     }
     ```

5. **`relation.txt`:**
   - Relationships between tables in plain text.
   - Format:
     ```
     // Table: glpi_agents
     From: glpi_agents.entities_id -> To: glpi_entities.id
     ```

6. **`relation_dbdiagram.dbml`:**
   - Relationships formatted for `dbdiagram.io`.
   - Format:
     ```
     Ref: glpi_agents.entities_id > glpi_entities.id
     ```

---

## Example Output

### table.txt
```
- glpi_agents
- glpi_entities
```

### structure.txt
```
- Table: glpi_agents
  -- id (int unsigned)
  -- deviceid (varchar(255))

- Table: glpi_entities
  -- id (int unsigned)
  -- name (varchar(255))
```

### table.dbml
```
Table glpi_agents {}
Table glpi_entities {}
```

### structure_dbdiagram.dbml
```
Table glpi_agents {
  id int [pk]
  deviceid varchar
}

Table glpi_entities {
  id int [pk]
  name varchar
}
```

### relation.txt
```
- Table: glpi_agents
From: glpi_agents.entities_id -> To: glpi_entities.id

- Table: glpi_tickets
From: glpi_tickets.users_id -> To: glpi_users.id
```

### relation_dbdiagram.dbml
```
Ref: glpi_agents.entities_id > glpi_entities.id
Ref: glpi_tickets.users_id > glpi_users.id
```

---

## Customization

To adjust the script for your needs:
- Modify naming conventions for relationships in the `detectRelationships` function.
- Add or remove specific exports by editing the `generateFiles` function.

---

## License

This project is open-source and available under the [MIT License](LICENSE).
