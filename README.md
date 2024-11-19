# **GLPI Database Schema and Relationship Exporter**

This Node.js project automates the process of exporting table structures and relationships from a GLPI database. The output includes files in both plain text and `dbdiagram.io`-compatible formats, making it easy to visualize and document the database schema.

---

## Features

- **Export Table Names**:
  - A plain text file listing all table names in the GLPI database.
- **Export Table Structures**:
  - Plain text format with column details.
  - DBML format for `dbdiagram.io`.
- **Export Relationships**:
  - Plain text format describing relationships between tables.
  - DBML format for `dbdiagram.io`.

---

## Project Idea: **Simplify GLPI Database Documentation**

This project is designed to help GLPI administrators and developers understand and document their database structure. By automating the schema and relationship export process, it ensures accurate and consistent documentation, aiding in tasks like troubleshooting, reporting, and database optimization.

---

## Prerequisites

To use this project, ensure the following:

1. **Node.js**: Installed on your system. [Download Node.js](https://nodejs.org/)
2. **MySQL Database**: Your GLPI database credentials must be available.
3. **Dependencies**: Install the `mysql2` library:
   ```bash
   npm install mysql2
   ```

---

## Setup

1. Clone or copy the script.
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

## Output Files

The script generates six files in the project directory:

### 1. `table.txt`
- A plain text file listing all table names in the GLPI database.
- **Example**:
  ```
  - glpi_agents
  - glpi_entities
  ```

---

### 2. `structure.txt`
- A plain text file containing the structure of each table with column details.
- **Example**:
  ```
  - Table: glpi_agents
    -- id (int unsigned)
    -- deviceid (varchar(255))

  - Table: glpi_entities
    -- id (int unsigned)
    -- name (varchar(255))
  ```

---

### 3. `table_dbdiagram.dbml`
- A DBML file listing all table names for `dbdiagram.io`.
- **Example**:
  ```
  Table glpi_agents {}
  Table glpi_entities {}
  ```

---

### 4. `structure_dbdiagram.dbml`
- A DBML file describing each table's structure in `dbdiagram.io` format.
- **Example**:
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

---

### 5. `relation.txt`
- A plain text file listing relationships between tables, grouped by table.
- **Example**:
  ```
  // Table: glpi_agents
  From: glpi_agents.entities_id -> To: glpi_entities.id



  // Table: glpi_tickets
  From: glpi_tickets.users_id -> To: glpi_users.id
  From: glpi_tickets.groups_id -> To: glpi_groups.id
  ```

---

### 6. `relation_dbdiagram.dbml`
- A DBML file describing relationships between tables for `dbdiagram.io`.
- **Example**:
  ```
  Ref: glpi_agents.entities_id > glpi_entities.id
  Ref: glpi_tickets.users_id > glpi_users.id
  Ref: glpi_tickets.groups_id > glpi_groups.id
  ```

---

## Example Workflow

1. **Run the Script**:
   ```bash
   node generate_files.js
   ```

2. **Generated Files**:
   - `table.txt`: View all tables in the database.
   - `structure.txt`: Review table structures for detailed documentation.
   - `relation.txt`: Understand relationships between tables.
   - Import `.dbml` files into `dbdiagram.io` for visualization.

3. **Visualize**:
   - Upload the `.dbml` files (`table_dbdiagram.dbml` and `structure_dbdiagram.dbml`) to [dbdiagram.io](https://dbdiagram.io).

---

## Customization

You can customize the script to adjust naming conventions, file paths, or database connection details. Modify these sections in the script as needed:

- **Database Connection**:
  Update credentials:
  ```javascript
  const connection = mysql.createConnection({
      host: 'your-database-host',
      user: 'your-database-username',
      password: 'your-database-password',
      database: 'your-database-name',
  });
  ```

- **File Paths**:
  Change the output file paths:
  ```javascript
  const files = {
      tableNames: './table.txt',
      tableStructure: './structure.txt',
      tableDbml: './table_dbdiagram.dbml',
      structureDbml: './structure_dbdiagram.dbml',
      relationText: './relation.txt',
      relationDbml: './relation_dbdiagram.dbml',
  };
  ```

---

## License

This project is open-source and available under the [MIT License](LICENSE).

---

## Feedback and Contributions

Feel free to contribute or provide feedback to improve the script. Submit a pull request or open an issue in the repository.
