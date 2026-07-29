const instructorRepository = require("../repositories/instructor.repository");

class InstructorController {
  async getInstructors(req, res) {
    try {
      const rawInstructors = await instructorRepository.getAllInstructors();
      
      const instructors = rawInstructors.map((inst, index) => ({
        id: inst.IdUser,
        name: inst.FullName,
        email: inst.Email,
        expertise: index % 2 === 0 ? "Data Science" : "Web Development",
        totalCourses: Math.floor(Math.random() * 8) + 1,
        totalStudents: Math.floor(Math.random() * 3000) + 100,
        rating: (4.2 + Math.random() * 0.8).toFixed(1),
        status: "ACTIVE",
      }));

      return res.status(200).json({ success: true, data: instructors });
    } catch (error) {
      console.error("Instructors error:", error);
      return res.status(500).json({ success: false, message: "Lỗi Server" });
    }
  }
}

module.exports = new InstructorController();