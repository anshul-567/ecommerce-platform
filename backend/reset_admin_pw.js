const pool = require('./db');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  const newPassword = 'adminpassword123';
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    const res = await pool.query(
      "UPDATE users SET password = $1 WHERE email = 'anshul931@email.com' RETURNING id, name, email, role",
      [hashedPassword]
    );

    if (res.rows.length > 0) {
      console.log('Password reset successfully for:', res.rows[0]);
    } else {
      console.log('User not found.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

resetPassword();
