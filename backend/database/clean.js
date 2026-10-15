import pool from '../config/db.js';

export async function cleanDatabase() {
  console.log('🧹 Cleaning MySQL database: removing all dummy data, keeping crops and admin...');

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // Wipe transaction/user data tables
    const tablesToWipe = [
      'activity_logs',
      'announcements',
      'complaints',
      'saved_searches',
      'saved_items',
      'notifications',
      'reviews',
      'messages',
      'deal_documents',
      'deal_status_history',
      'deals',
      'offers',
      'buyer_requirements',
      'listing_images',
      'produce_listings',
      'verification_documents',
      'enterprise_profiles',
      'farmer_profiles',
    ];

    for (const t of tablesToWipe) {
      await connection.query(`TRUNCATE TABLE ${t}`);
      console.log(`  ✓ Truncated table: ${t}`);
    }

    // Remove all users except admin
    await connection.query("DELETE FROM users WHERE role != 'admin'");
    console.log('  ✓ Removed non-admin dummy users');

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    await connection.commit();
    console.log('✨ Database cleaned successfully! Master Crops and Admin preserved.');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Clean database failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

cleanDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
