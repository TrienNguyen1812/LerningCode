const studentRepository = require("../repositories/student.repository");

class StudentController {
  async getStudents(req, res) {
    try {
      const rawStudents = await studentRepository.getAllStudents();

      const students = rawStudents.map((st) => ({
        id: st.IdUser,
        name: st.FullName,
        email: st.Email,
        joinedDate: st.JoinedDate,
        coursesEnrolled: st.CoursesEnrolled,
        progress: Math.floor(Math.random() * 100),
        status: "Active",
      }));

      return res.status(200).json({ success: true, data: students });
    } catch (error) {
      console.error("Students error:", error);
      return res.status(500).json({ success: false, message: "Lỗi Server" });
    }
  }
}

module.exports = new StudentController();