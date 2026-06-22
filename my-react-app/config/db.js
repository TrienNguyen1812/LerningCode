const sql = require('mssql/msnodesqlv8');

const dbConfig = {
  // Thay 'localhost' bằng tên Server name của bạn trong SSMS nếu cần (VD: 'localhost\\SQLEXPRESS')
  server: '(localdb)\\MSSQLLocalDB', 
  database: 'DevLearnerDB',
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true,
    encrypt: false 
  }
};

const connectDB = async () => {
  try {
    const pool = await sql.connect(dbConfig);
    console.log('Đã kết nối thành công tới SQL Server: DevLearnerDB');
    return pool;
  } catch (error) {
    console.error('Lỗi kết nối CSDL:', error);
    process.exit(1);
  }
};

module.exports = { sql, connectDB };