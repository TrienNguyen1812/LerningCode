const problemRepository = require('../repositories/problem.repository');

class ProblemController {
  // 1. Lấy danh sách bài tập
  async getAll(req, res) {
    try {
      const problems = await problemRepository.findAll();
      res.status(200).json({ success: true, data: problems });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // 2. Lấy chi tiết 1 bài tập
  async getById(req, res) {
    try {
      const problem = await problemRepository.findById(req.params.id);
      if (!problem) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập!' });
      }
      res.status(200).json({ success: true, data: problem });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // 3. Tạo mới bài tập
  async create(req, res) {
    try {
      const { title, description, difficulty, timeLimit, memoryLimit, sampleCode, aiPromptInstruction, deadline, testCases } = req.body;

      if (!title || !difficulty) {
        return res.status(400).json({ success: false, message: 'Tên bài tập và độ khó không được để trống!' });
      }

      const newId = await problemRepository.createWithTestCases(
        { title, description, difficulty, timeLimit, memoryLimit, sampleCode, aiPromptInstruction, deadline },
        testCases
      );

      res.status(201).json({ success: true, message: 'Tạo bài tập thành công!', problemId: newId });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // 4. Cập nhật bài tập
  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, description, difficulty, timeLimit, memoryLimit, sampleCode, aiPromptInstruction, deadline, testCases } = req.body;

      await problemRepository.update(
        id,
        { title, description, difficulty, timeLimit, memoryLimit, sampleCode, aiPromptInstruction, deadline },
        testCases
      );

      res.status(200).json({ success: true, message: 'Cập nhật bài tập thành công!' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // 5. Xóa bài tập
  async delete(req, res) {
    try {
      await problemRepository.delete(req.params.id);
      res.status(200).json({ success: true, message: 'Xóa bài tập thành công!' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new ProblemController();