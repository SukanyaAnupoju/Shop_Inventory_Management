// Vite: define VITE_API_URL in .env (e.g., http://localhost:8000/api)
const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8001/api";
export default baseUrl;
