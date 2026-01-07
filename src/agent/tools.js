const { pool } = require("../db/pool");

async function createTask({ title, description, due_date, priority }) {
  const { rows } = await pool.query(
    `INSERT INTO tasks (title, description, due_date, priority)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [title, description || null, due_date || null, priority || "medium"]
  );
  return rows[0];
}

async function updateTask({ id, title, status }) {
  const { rows } = await pool.query(
    `
    UPDATE tasks
    SET status = $1, updated_at = NOW()
    WHERE id = $2 OR LOWER(title) LIKE LOWER($3)
    RETURNING *
    `,
    [status, id || null, title ? `%${title}%` : null]
  );
  return rows;
}

async function deleteTask({ id, title }) {
  const { rows } = await pool.query(
    `
    DELETE FROM tasks
    WHERE id = $1 OR LOWER(title) LIKE LOWER($2)
    RETURNING *
    `,
    [id || null, title ? `%${title}%` : null]
  );
  return rows;
}

async function listTasks() {
  const { rows } = await pool.query(
    `SELECT * FROM tasks ORDER BY created_at DESC`
  );
  return rows;
}

async function filterTasks({ status, priority }) {
  const conditions = [];
  const values = [];

  if (status) {
    conditions.push(`status = $${values.length + 1}`);
    values.push(status);
  }
  if (priority) {
    conditions.push(`priority = $${values.length + 1}`);
    values.push(priority);
  }

  const query = `
    SELECT * FROM tasks
    ${conditions.length ? "WHERE " + conditions.join(" AND ") : ""}
    ORDER BY created_at DESC
  `;

  const { rows } = await pool.query(query, values);
  return rows;
}

module.exports = {
  createTask,
  updateTask,
  deleteTask,
  listTasks,
  filterTasks
};
