const BACKEND_URL = "http://localhost:3001";
import axios from "axios";

export default axios.create({
  baseURL: BACKEND_URL,
  headers: { "Content-Type": "application/json" },
});