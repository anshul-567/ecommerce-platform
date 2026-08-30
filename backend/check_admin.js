const pool = require('./db');
const bcrypt = require('bcryptjs');

async function checkAndCreateAdmin() {
  try {
    const res = await pool.query("SELECT id, name, email, role FROM users WHERE role = 'admin'");
    console.log('Existing admins:', res.rows);

    // If no admin exists, create a default admin
    if (res.rows.length === 0) {
      const email = 'admin@example.com';
      const password = 'adminpassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
      if (userCheck.rows.length > 0) {
        await pool.query("UPDATE users SET role = 'admin' WHERE email = $1", [email]);
      } else {
        await pool.query(
          "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'admin')",
          ['Admin User', email, hashedPassword]
        );
      }
      console.log('Created/Promoted default admin:');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkAndCreateAdmin();
