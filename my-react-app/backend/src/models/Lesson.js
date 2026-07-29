class Lesson {
  constructor({ 
    IdLesson, 
    Title, 
    Content, 
    CreateDate, 
    Order_index, 
    IdCourse, 
    Files = [], 
    Problems = []
  }) {
    this.id = IdLesson;
    this.IdLesson = IdLesson;
    this.title = Title;
    this.content = Content;
    this.createDate = CreateDate;
    this.orderIndex = Order_index;
    this.idCourse = IdCourse;
    this.files = Files;
    this.problems = Problems;
  }
}

module.exports = Lesson;