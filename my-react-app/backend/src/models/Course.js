class Course {
  constructor({ IdCourse, CourseName, Description, CreateDate, Thumbnail }) {
    this.id = IdCourse;
    this.courseName = CourseName;
    this.description = Description;
    this.createDate = CreateDate;
    this.thumbnail = Thumbnail;
  }
}

module.exports = Course;