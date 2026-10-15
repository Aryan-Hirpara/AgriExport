import pool from '../config/db.js';

export async function cleanDatabase() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: Database clean script is disabled in production environment!');
  }
  console.log('🧹 Cleaning MySQL database: removing all dummy data, keeping crops and admin...');

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    console.log('🧹 Cleaning MySQL database: removing all dummy users & entries via foreign key CASCADE...');

    // Delete all dummy users - MySQL foreign key CASCADE automatically deletes
    // all their produce listings, buyer requirements, offers, deals, messages, reviews, etc.
    const [delUsers] = await connection.query(
      `DELETE FROM users WHERE email NOT IN ('admin@agriexport.in', 'aryanhirpara650@gmail.com')`
    );
    console.log(`  ✓ Removed ${delUsers.affectedRows} dummy users and cascaded all their items, requirements & deals.`);

    // Also clean up any unlinked orphan announcements or logs if needed
    await connection.query("DELETE FROM announcements WHERE target_role != 'admin' AND starts_at < NOW()");

    await connection.commit();
    console.log('✨ Database cleaned successfully via CASCADE! Admin & Aryan Hirpara preserved.');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Clean database failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

cleanDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
