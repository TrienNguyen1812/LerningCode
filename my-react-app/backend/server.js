const express = require('express');
const cors = require('cors');
const sql = require('mssql/msnodesqlv8');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ==========================================
// 1. CẤU HÌNH KẾT NỐI DATABASE (KẾT NỐI 1 LẦN DUY NHẤT)
// ==========================================
const dbConfig = {
  server: '(localdb)\\MSSQLLocalDB',
  database: 'DevLearnerDB',
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true,
    encrypt: false 
  }
};

// Tạo một Pool kết nối để dùng chung cho mọi API
const poolPromise = sql.connect(dbConfig)
  .then(pool => {
    console.log('Đã kết nối thành công tới SQL Server: DevLearnerDB');
    return pool;
  })
  .catch(err => {
    console.error('Lỗi kết nối CSDL:', err);
  });

// ==========================================
// 2. API ĐĂNG KÝ TÀI KHOẢN
// ==========================================
app.post('/api/register', async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const pool = await poolPromise; // Lấy kết nối đã có sẵn

    // Kiểm tra trùng Email
    const checkUser = await pool.request()
      .input('Email', sql.VarChar, email)
      .query(`SELECT IdUser FROM USERS WHERE Email = @Email`);

    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ success: false, message: "Email này đã được đăng ký!" });
    }

    // Thêm vào DB
    await pool.request()
      .input('FullName', sql.NVarChar, fullName)
      .input('Email', sql.VarChar, email)
      .input('Password', sql.VarChar, password)
      .query(`
        INSERT INTO USERS (FullName, Email, Role, CreateDate, UpdateDate, Password)
        VALUES (@FullName, @Email, N'sinh viên', GETDATE(), GETDATE(), @Password)
      `);

    res.status(201).json({ success: true, message: "Đăng ký thành công! Bạn có thể đăng nhập ngay." });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
});

// ==========================================
// 3. API ĐĂNG NHẬP
// ==========================================
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const pool = await poolPromise; // Lấy kết nối đã có sẵn
    const result = await pool.request()
      .input('Email', sql.VarChar, email)
      .input('Password', sql.VarChar, password)
      .query(`SELECT IdUser, FullName, Email, Role FROM USERS WHERE Email = @Email AND Password = @Password`);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      res.status(200).json({
        success: true,
        user: { id: user.IdUser, fullName: user.FullName, email: user.Email, role: user.Role }
      });
    } else {
      res.status(401).json({ success: false, message: "Email hoặc mật khẩu không chính xác!" });
    }
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
});

// ==========================================
// 4. API DASHBOARD QUẢN TRỊ VIÊN
// ==========================================
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const pool = await poolPromise;
    const studentCount = await pool.request().query(`SELECT COUNT(*) as Total FROM USERS WHERE Role = N'sinh viên'`);
    const courseCount = await pool.request().query(`SELECT COUNT(*) as Total FROM COURSE`);
    const topCourses = await pool.request().query(`
      SELECT TOP 4 c.CourseName, COUNT(e.IdUser) as EnrolledCount
      FROM COURSE c LEFT JOIN Enroll e ON c.IdCourse = e.IdCourse
      GROUP BY c.CourseName ORDER BY EnrolledCount DESC
    `);
    
    res.status(200).json({ 
      success: true, 
      data: {
        metrics: [
          { title: "Total Students", value: studentCount.recordset[0].Total.toLocaleString(), trend: "+12%", isUp: true },
          { title: "Active Courses", value: courseCount.recordset[0].Total.toString(), trend: "+5%", isUp: true },
          { title: "Total Revenue", value: "$45,200", trend: "+10%", isUp: true }, 
          { title: "Completion Rate", value: "78%", trend: "-2%", isUp: false }    
        ],
        enrollmentChart: [ { month: "Jan", percent: 35 }, { month: "Feb", percent: 45 }, { month: "Mar", percent: 65 }, { month: "Apr", percent: 55 }, { month: "May", percent: 85 }, { month: "Jun", percent: 100 } ],
        topCourses: topCourses.recordset.length > 0 ? topCourses.recordset.map(c => ({ name: c.CourseName, students: c.EnrolledCount, percent: 80 })) : [{ name: "Chưa có dữ liệu", students: 0, percent: 0 }],
        recentActivities: []
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

app.get('/api/admin/courses', async (req, res) => {
  try {
    const pool = await poolPromise;
    const coursesResult = await pool.request().query(`
      SELECT c.IdCourse, c.CourseName, CONVERT(varchar, c.CreateDate, 103) AS CreateDateStr, COUNT(e.IdUser) as EnrolledCount
      FROM COURSE c LEFT JOIN Enroll e ON c.IdCourse = e.IdCourse
      GROUP BY c.IdCourse, c.CourseName, c.CreateDate ORDER BY c.CreateDate DESC
    `);
    
    const coursesData = coursesResult.recordset.map(course => ({
      id: course.IdCourse.toString(), name: course.CourseName, updatedAt: course.CreateDateStr, instructor: "Giảng viên", category: "Technology", enrolled: course.EnrolledCount.toLocaleString(), status: "Published"                
    }));

    res.status(200).json({ success: true, data: coursesData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// Khởi động Server
app.listen(PORT, () => {
  console.log(`Backend đang chạy tại http://localhost:${PORT}`);
});
// ==========================================
// 5. API QUẢN LÝ GIẢNG VIÊN (INSTRUCTOR MANAGEMENT)
// ==========================================
app.get('/api/admin/instructors', async (req, res) => {
  try {
    const pool = await poolPromise;
    // Lấy dữ liệu những người có Role là 'giảng viên'
    const result = await pool.request().query(`
      SELECT IdUser, FullName, Email 
      FROM USERS 
      WHERE Role = N'giảng viên'
    `);
    
    // Ghép thêm các dữ liệu giả lập (Rating, Expertise...) để khớp UI thiết kế
    const instructors = result.recordset.map((inst, index) => ({
      id: inst.IdUser,
      name: inst.FullName,
      email: inst.Email,
      expertise: index % 2 === 0 ? "Data Science" : "Web Development",
      totalCourses: Math.floor(Math.random() * 8) + 1,
      totalStudents: Math.floor(Math.random() * 3000) + 100,
      rating: (4.2 + Math.random() * 0.8).toFixed(1),
      status: "ACTIVE"
    }));

    res.status(200).json({ success: true, data: instructors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ==========================================
// 6. API QUẢN LÝ HỌC VIÊN (STUDENT DIRECTORY)
// ==========================================
app.get('/api/admin/students', async (req, res) => {
  try {
    const pool = await poolPromise;
    // Lấy danh sách học viên và ĐẾM số khóa học họ đã đăng ký từ bảng Enroll
    const result = await pool.request().query(`
      SELECT 
        u.IdUser, u.FullName, u.Email, 
        CONVERT(varchar, u.CreateDate, 107) as JoinedDate,
        COUNT(e.IdCourse) as CoursesEnrolled
      FROM USERS u
      LEFT JOIN Enroll e ON u.IdUser = e.IdUser
      WHERE u.Role = N'sinh viên'
      GROUP BY u.IdUser, u.FullName, u.Email, u.CreateDate
      ORDER BY u.CreateDate DESC
    `);
    
    const students = result.recordset.map(st => ({
      id: st.IdUser,
      name: st.FullName,
      email: st.Email,
      joinedDate: st.JoinedDate,
      coursesEnrolled: st.CoursesEnrolled,
      progress: Math.floor(Math.random() * 100), // Giả lập phần trăm hoàn thành
      status: "Active"
    }));

    res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});
// ==========================================
// THÊM KHÓA HỌC MỚI VÀO DATABASE
// ==========================================
app.post('/api/admin/courses', async (req, res) => {
  const { courseName } = req.body;
  try {
    const pool = await poolPromise;
    // Thêm dữ liệu vào bảng COURSE
    await pool.request()
      .input('CourseName', sql.NVarChar, courseName)
      .query(`INSERT INTO COURSE (CourseName, CreateDate) VALUES (@CourseName, GETDATE())`);
    
    res.status(201).json({ success: true, message: "Thêm khóa học thành công!" });
  } catch (error) {
    console.error("Lỗi thêm khóa học:", error);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// ==========================================
// XÓA KHÓA HỌC KHỎI DATABASE
// ==========================================
app.delete('/api/admin/courses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    
    // Lưu ý quan trọng: Phải xóa khóa ngoại trong bảng Enroll trước, sau đó mới xóa Course
    await pool.request()
      .input('IdCourse', sql.Int, id)
      .query(`DELETE FROM Enroll WHERE IdCourse = @IdCourse`);
      
    await pool.request()
      .input('IdCourse', sql.Int, id)
      .query(`DELETE FROM COURSE WHERE IdCourse = @IdCourse`);

    res.status(200).json({ success: true, message: "Xóa thành công!" });
  } catch (error) {
    console.error("Lỗi xóa khóa học:", error);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});
// ==========================================
// CHỈNH SỬA KHÓA HỌC (UPDATE COURSE)
// ==========================================
app.put('/api/admin/courses/:id', async (req, res) => {
  const { id } = req.params;
  const { courseName } = req.body; // Nhận tên mới từ Frontend gửi lên

  try {
    const pool = await poolPromise;
    
    await pool.request()
      .input('IdCourse', sql.Int, id)
      .input('CourseName', sql.NVarChar, courseName)
      .query(`
        UPDATE COURSE 
        SET CourseName = @CourseName 
        WHERE IdCourse = @IdCourse
      `);

    res.status(200).json({ success: true, message: "Cập nhật tên khóa học thành công!" });
  } catch (error) {
    console.error("Lỗi cập nhật khóa học:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
}); 