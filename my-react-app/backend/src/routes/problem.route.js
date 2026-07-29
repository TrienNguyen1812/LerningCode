const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problem.controller');

// Xem danh sách và chi tiết bài tập
router.get('/', problemController.getAll);
router.get('/:id', problemController.getById);

// Tạo, Sửa, Xóa bài tập (Giai đoạn này tạm bỏ middleware xác thực)
router.post('/', problemController.create);
router.put('/:id', problemController.update);
router.delete('/:id', problemController.delete);

module.exports = router;