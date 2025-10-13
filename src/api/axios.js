import axios from "axios";
// kept for optional external API usage; Firebase used for core data
const api = axios.create({ baseURL: "http://localhost:4000" });
export default api;
