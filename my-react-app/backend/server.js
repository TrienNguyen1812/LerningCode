// const express = require('express');
// const cors = require('cors');
// // Sử dụng msnodesqlv8 để hỗ trợ Windows Authentication
// const sql = require('mssql/msnodesqlv8'); 

// const app = express();
// app.use(cors());
// app.use(express.json());

// // ==========================================
// // 1. CẤU HÌNH KẾT NỐI LOCALDB & WINDOWS AUTHENTICATION
// // ==========================================
// const dbConfig = {
//   server: '(localdb)\\MSSQLLocalDB', 
//   database: 'DevLearnerDB',
//   driver: 'msnodesqlv8',
//   options: {
//     trustedConnection: true, // Bật chế độ Windows Authentication (Không cần pass)
//     trustServerCertificate: true
//   }
// };

// const poolPromise = new sql.ConnectionPool(dbConfig)
//   .connect()
//   .then(pool => {
//     console.log('✅ Đã kết nối thành công tới Database DevLearnerDB!');
//     return pool;
//   })
//   .catch(err => console.log('❌ Lỗi kết nối CSDL: ', err));


// // ==========================================
// // 2. API ĐĂNG NHẬP (QUAN TRỌNG NHẤT ĐỂ VÀO TRANG)
// // ==========================================
// app.post('/api/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const pool = await poolPromise;
//     const result = await pool.request()
//       .input('Email', sql.VarChar, email)
//       .input('Password', sql.VarChar, password)
//       .query(`SELECT * FROM USERS WHERE Email = @Email AND Password = @Password`);

//     if (result.recordset.length > 0) {
//       const user = result.recordset[0];
//       res.json({ 
//         success: true, 
//         user: { id: user.IdUser, fullName: user.FullName, email: user.Email, role: user.Role } 
//       });
//     } else {
//       res.status(401).json({ success: false, message: 'Sai email hoặc mật khẩu!' });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Lỗi server' });
//   }
// });


// // ==========================================
// // 3. API LẤY DỮ LIỆU TỔNG QUAN (DASHBOARD)
// // ==========================================
// app.get('/api/admin/dashboard', async (req, res) => {
//   try {
//     const pool = await poolPromise;
//     const studentCount = await pool.request().query(`SELECT COUNT(*) as total FROM USERS WHERE Role = N'sinh viên'`);
//     const instructorCount = await pool.request().query(`SELECT COUNT(*) as total FROM USERS WHERE Role = N'giảng viên'`);
//     const courseCount = await pool.request().query(`SELECT COUNT(*) as total FROM COURSE`);
    
//     const topCourses = await pool.request().query(`
//       SELECT TOP 3 c.CourseName as name, COUNT(e.IdUser) as students
//       FROM COURSE c LEFT JOIN Enroll e ON c.IdCourse = e.IdCourse
//       GROUP BY c.CourseName ORDER BY students DESC
//     `);

//     const dashboardData = {
//       metrics: [
//         { title: "Tổng Sinh Viên", value: studentCount.recordset[0].total.toString(), trend: "+5%", isUp: true },
//         { title: "Tổng Khóa Học", value: courseCount.recordset[0].total.toString(), trend: "+2%", isUp: true },
//         { title: "Tổng Giảng Viên", value: instructorCount.recordset[0].total.toString(), trend: "Ổn định", isUp: true },
//         { title: "Doanh thu", value: "0 VNĐ", trend: "-", isUp: false }
//       ],
//       topCourses: topCourses.recordset.map(c => ({
//         name: c.name, students: c.students + " học viên", percent: c.students > 0 ? 80 : 0 
//       })),
//       enrollmentChart: [
//         { month: 'T1', percent: 40 }, { month: 'T2', percent: 60 }, { month: 'T3', percent: 45 },
//         { month: 'T4', percent: 80 }, { month: 'T5', percent: 55 }, { month: 'T6', percent: 90 },
//       ]
//     };
//     res.status(200).json({ success: true, data: dashboardData });
//   } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
// });

// // ==========================================
// // 4. API QUẢN LÝ KHÓA HỌC (CHỈ GỒM NAME & DESCRIPTION)
// // ==========================================
// app.get('/api/admin/courses', async (req, res) => {
//   try {
//     const pool = await poolPromise;
//     const result = await pool.request().query(`
//       SELECT 
//         c.IdCourse as id, 
//         c.CourseName as name, 
//         c.Description as description,
//         CONVERT(varchar, c.CreateDate, 103) as updatedAt,
//         ISNULL((SELECT COUNT(*) FROM Enroll e WHERE e.IdCourse = c.IdCourse), 0) as enrolled
//       FROM COURSE c ORDER BY c.IdCourse DESC
//     `);
    
//     const courses = result.recordset.map(course => ({
//       id: course.id, 
//       name: course.name, 
//       description: course.description,
//       updatedAt: course.updatedAt || 'Mới đây',
//       instructor: "Chưa phân công", 
//       enrolled: course.enrolled, 
//       status: "Published" 
//     }));
//     res.status(200).json({ success: true, data: courses });
//   } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
// });

// app.post('/api/admin/courses', async (req, res) => {
//   const { name, description } = req.body;
//   // Bắt buộc nhập cả tên và mô tả vì DB của bạn set NOT NULL
//   if (!name || !description) return res.status(400).json({ success: false, message: "Tên và mô tả không được trống!" });
  
//   try {
//     const pool = await poolPromise;
//     await pool.request()
//       .input('CourseName', sql.NVarChar, name)
//       .input('Description', sql.NVarChar, description)
//       .query(`
//         INSERT INTO COURSE (CourseName, Description, CreateDate) 
//         VALUES (@CourseName, @Description, GETDATE())
//       `);
//     res.status(201).json({ success: true, message: "Thêm thành công!" });
//   } catch (error) { res.status(500).json({ success: false, message: error.message }); }
// });

// app.put('/api/admin/courses/:id', async (req, res) => {
//   const { id } = req.params; 
//   const { name, description } = req.body;
//   try {
//     const pool = await poolPromise;
//     await pool.request()
//       .input('IdCourse', sql.Int, id)
//       .input('CourseName', sql.NVarChar, name)
//       .input('Description', sql.NVarChar, description)
//       .query(`
//         UPDATE COURSE 
//         SET CourseName = @CourseName, Description = @Description
//         WHERE IdCourse = @IdCourse
//       `);
//     res.status(200).json({ success: true, message: "Cập nhật thành công!" });
//   } catch (error) { res.status(500).json({ success: false }); }
// });

// // API Delete giữ nguyên...
// app.delete('/api/admin/courses/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     const pool = await poolPromise;
//     await pool.request().input('IdCourse', sql.Int, id).query(`DELETE FROM Enroll WHERE IdCourse = @IdCourse`);
//     await pool.request().input('IdCourse', sql.Int, id).query(`DELETE FROM COURSE WHERE IdCourse = @IdCourse`);
//     res.status(200).json({ success: true, message: "Xóa thành công!" });
//   } catch (error) { res.status(500).json({ success: false }); }
// });

// // ==========================================
// // 5. API LẤY DANH SÁCH GIẢNG VIÊN VÀ HỌC VIÊN
// // ==========================================
// app.get('/api/admin/instructors', async (req, res) => {
//   try {
//     const pool = await poolPromise;
//     const result = await pool.request().query(`
//       SELECT IdUser as id, FullName as name, Email as email FROM USERS WHERE Role = N'giảng viên' ORDER BY CreateDate DESC
//     `);
//     const instructors = result.recordset.map(inst => ({
//       id: inst.id, name: inst.name, email: inst.email, totalCourses: 0, rating: "5.0", status: "Active"
//     }));
//     res.status(200).json({ success: true, data: instructors });
//   } catch (error) { res.status(500).json({ success: false }); }
// });

// app.get('/api/admin/students', async (req, res) => {
//   try {
//     const pool = await poolPromise;
//     const result = await pool.request().query(`
//       SELECT u.IdUser as id, u.FullName as name, u.Email as email, CONVERT(varchar, u.CreateDate, 103) as joinedDate,
//       (SELECT COUNT(*) FROM Enroll e WHERE e.IdUser = u.IdUser) as coursesEnrolled
//       FROM USERS u WHERE u.Role = N'sinh viên' ORDER BY u.CreateDate DESC
//     `);
//     const students = result.recordset.map(st => ({
//       id: st.id, name: st.name, email: st.email, joinedDate: st.joinedDate || 'Chưa rõ',
//       coursesEnrolled: st.coursesEnrolled, progress: st.coursesEnrolled > 0 ? 50 : 0 
//     }));
//     res.status(200).json({ success: true, data: students });
//   } catch (error) { res.status(500).json({ success: false }); }
// });

// // ==========================================
// // 6. LỆNH KHỞI ĐỘNG SERVER
// // ==========================================
// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server Backend đã khởi động thành công tại cổng ${PORT}`);
// });
// // ==========================================
// // API DÀNH CHO TRANG SINH VIÊN (Lấy danh sách khóa học)
// // ==========================================
// app.get('/api/student/courses', async (req, res) => {
//   try {
//     const pool = await poolPromise;
//     // Lấy toàn bộ khóa học đang có trong hệ thống
//     const result = await pool.request().query(`
//       SELECT IdCourse as id, CourseName as name 
//       FROM COURSE 
//       ORDER BY IdCourse DESC
//     `);
    
//     res.status(200).json({ success: true, data: result.recordset });
//   } catch (error) {
//     console.error("Lỗi lấy khóa học cho sinh viên:", error);
//     res.status(500).json({ success: false, message: "Lỗi Server" });
//   }
// });
const express = require('express');
const cors = require('cors');
// Sử dụng msnodesqlv8 để hỗ trợ Windows Authentication
const sql = require('mssql/msnodesqlv8'); 

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. CẤU HÌNH KẾT NỐI LOCALDB & WINDOWS AUTHENTICATION
// ==========================================
const dbConfig = {
  server: '(localdb)\\MSSQLLocalDB', 
  database: 'DevLearnerDB',
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true, // Bật chế độ Windows Authentication (Không cần pass)
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('✅ Đã kết nối thành công tới Database DevLearnerDB!');
    return pool;
  })
  .catch(err => console.log('❌ Lỗi kết nối CSDL: ', err));


// ==========================================
// 2. API ĐĂNG NHẬP (QUAN TRỌNG NHẤT ĐỂ VÀO TRANG)
// ==========================================
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Email', sql.VarChar, email)
      .input('Password', sql.VarChar, password)
      .query(`SELECT * FROM USERS WHERE Email = @Email AND Password = @Password`);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      res.json({ 
        success: true, 
        user: { id: user.IdUser, fullName: user.FullName, email: user.Email, role: user.Role } 
      });
    } else {
      res.status(401).json({ success: false, message: 'Sai email hoặc mật khẩu!' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});


// ==========================================
// 3. API LẤY DỮ LIỆU TỔNG QUAN (DASHBOARD)
// ==========================================
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const pool = await poolPromise;
    const studentCount = await pool.request().query(`SELECT COUNT(*) as total FROM USERS WHERE Role = N'sinh viên'`);
    const instructorCount = await pool.request().query(`SELECT COUNT(*) as total FROM USERS WHERE Role = N'giảng viên'`);
    const courseCount = await pool.request().query(`SELECT COUNT(*) as total FROM COURSE`);
    
    const topCourses = await pool.request().query(`
      SELECT TOP 3 c.CourseName as name, COUNT(e.IdUser) as students
      FROM COURSE c LEFT JOIN Enroll e ON c.IdCourse = e.IdCourse
      GROUP BY c.CourseName ORDER BY students DESC
    `);

    const dashboardData = {
      metrics: [
        { title: "Tổng Sinh Viên", value: studentCount.recordset[0].total.toString(), trend: "+5%", isUp: true },
        { title: "Tổng Khóa Học", value: courseCount.recordset[0].total.toString(), trend: "+2%", isUp: true },
        { title: "Tổng Giảng Viên", value: instructorCount.recordset[0].total.toString(), trend: "Ổn định", isUp: true },
        { title: "Doanh thu", value: "0 VNĐ", trend: "-", isUp: false }
      ],
      topCourses: topCourses.recordset.map(c => ({
        name: c.name, students: c.students + " học viên", percent: c.students > 0 ? 80 : 0 
      })),
      enrollmentChart: [
        { month: 'T1', percent: 40 }, { month: 'T2', percent: 60 }, { month: 'T3', percent: 45 },
        { month: 'T4', percent: 80 }, { month: 'T5', percent: 55 }, { month: 'T6', percent: 90 },
      ]
    };
    res.status(200).json({ success: true, data: dashboardData });
  } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
});

// ==========================================
// 4. API QUẢN LÝ KHÓA HỌC (ĐÃ THÊM IMAGEURL)
// ==========================================
app.get('/api/admin/courses', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        c.IdCourse as id, 
        c.CourseName as name, 
        c.Description as description,
        c.ImageURL as imageUrl,
        CONVERT(varchar, c.CreateDate, 103) as updatedAt,
        ISNULL((SELECT COUNT(*) FROM Enroll e WHERE e.IdCourse = c.IdCourse), 0) as enrolled
      FROM COURSE c ORDER BY c.IdCourse DESC
    `);
    
    const courses = result.recordset.map(course => ({
      id: course.id, 
      name: course.name, 
      description: course.description,
      imageUrl: course.imageUrl,
      updatedAt: course.updatedAt || 'Mới đây',
      instructor: "Chưa phân công", 
      enrolled: course.enrolled, 
      status: "Published" 
    }));
    res.status(200).json({ success: true, data: courses });
  } catch (error) { res.status(500).json({ success: false, message: "Lỗi Server" }); }
});

app.post('/api/admin/courses', async (req, res) => {
  const { name, description, imageUrl } = req.body;
  
  if (!name || !description) return res.status(400).json({ success: false, message: "Tên và mô tả không được trống!" });
  
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('CourseName', sql.NVarChar, name)
      .input('Description', sql.NVarChar, description)
      .input('ImageURL', sql.NVarChar, imageUrl || '')
      .query(`
        INSERT INTO COURSE (CourseName, Description, ImageURL, CreateDate) 
        VALUES (@CourseName, @Description, @ImageURL, GETDATE())
      `);
    res.status(201).json({ success: true, message: "Thêm thành công!" });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.put('/api/admin/courses/:id', async (req, res) => {
  const { id } = req.params; 
  const { name, description, imageUrl } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('IdCourse', sql.Int, id)
      .input('CourseName', sql.NVarChar, name)
      .input('Description', sql.NVarChar, description)
      .input('ImageURL', sql.NVarChar, imageUrl || '')
      .query(`
        UPDATE COURSE 
        SET CourseName = @CourseName, Description = @Description, ImageURL = @ImageURL
        WHERE IdCourse = @IdCourse
      `);
    res.status(200).json({ success: true, message: "Cập nhật thành công!" });
  } catch (error) { res.status(500).json({ success: false }); }
});

// API Delete giữ nguyên...
app.delete('/api/admin/courses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request().input('IdCourse', sql.Int, id).query(`DELETE FROM Enroll WHERE IdCourse = @IdCourse`);
    await pool.request().input('IdCourse', sql.Int, id).query(`DELETE FROM COURSE WHERE IdCourse = @IdCourse`);
    res.status(200).json({ success: true, message: "Xóa thành công!" });
  } catch (error) { res.status(500).json({ success: false }); }
});

// ==========================================
// 5. API LẤY DANH SÁCH GIẢNG VIÊN VÀ HỌC VIÊN
// ==========================================
app.get('/api/admin/instructors', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT IdUser as id, FullName as name, Email as email FROM USERS WHERE Role = N'giảng viên' ORDER BY CreateDate DESC
    `);
    const instructors = result.recordset.map(inst => ({
      id: inst.id, name: inst.name, email: inst.email, totalCourses: 0, rating: "5.0", status: "Active"
    }));
    res.status(200).json({ success: true, data: instructors });
  } catch (error) { res.status(500).json({ success: false }); }
});

app.get('/api/admin/students', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT u.IdUser as id, u.FullName as name, u.Email as email, CONVERT(varchar, u.CreateDate, 103) as joinedDate,
      (SELECT COUNT(*) FROM Enroll e WHERE e.IdUser = u.IdUser) as coursesEnrolled
      FROM USERS u WHERE u.Role = N'sinh viên' ORDER BY u.CreateDate DESC
    `);
    const students = result.recordset.map(st => ({
      id: st.id, name: st.name, email: st.email, joinedDate: st.joinedDate || 'Chưa rõ',
      coursesEnrolled: st.coursesEnrolled, progress: st.coursesEnrolled > 0 ? 50 : 0 
    }));
    res.status(200).json({ success: true, data: students });
  } catch (error) { res.status(500).json({ success: false }); }
});

// ==========================================
// API DÀNH CHO TRANG SINH VIÊN (ĐÃ THÊM IMAGEURL)
// ==========================================
app.get('/api/student/courses', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT IdCourse as id, CourseName as name, Description as description, ImageURL as image 
      FROM COURSE 
      ORDER BY IdCourse DESC
    `);
    
    res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Lỗi lấy khóa học cho sinh viên:", error);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ==========================================
// 6. LỆNH KHỞI ĐỘNG SERVER (Luôn để dưới cùng)
// ==========================================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server Backend đã khởi động thành công tại cổng ${PORT}`);
});


// Lấy danh sách Lesson theo Course
// app.get('/api/admin/courses/:id/lessons', async (req, res) => {
//     const pool = await poolPromise;
//     const result = await pool.request()
//         .input('IdCourse', req.params.id)
//         .query('SELECT * FROM LESSON WHERE IdCourse = @IdCourse ORDER BY Order_index');
//     res.json({ success: true, data: result.recordset });
// });

// Lấy danh sách bài tập của 1 bài học cụ thể
// app.get('/api/admin/lessons/:id/problems', async (req, res) => {
//     const pool = await poolPromise;
//     const result = await pool.request()
//         .input('IdLesson', req.params.id)
//         .query('SELECT * FROM PROBLEM WHERE IdLesson = @IdLesson');
//     res.json({ success: true, data: result.recordset });
// });

// Lấy danh sách Lesson theo Course ID
app.get('/api/admin/courses/:id/lessons', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('IdCourse', sql.Int, req.params.id) // Nhận ID khóa học từ URL
      .query('SELECT * FROM LESSON WHERE IdCourse = @IdCourse ORDER BY Order_index');
      
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error("Lỗi lấy bài học:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});