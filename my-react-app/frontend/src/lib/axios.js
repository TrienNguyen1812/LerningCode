import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api", // Sửa lại PORT đúng với backend NodeJS của bạn
});

export default axiosClient;