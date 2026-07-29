import axiosClient from "../lib/axios";

export const courseService = {
  createCourse: async (formData) => {
    // Gọi API POST /courses với header multipart/form-data để đẩy file
    const response = await axiosClient.post("/courses", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};