import axios from "axios";

const apiURL = window.location.origin;
const api = axios.create({
  baseURL: `${apiURL}/api/auth`,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(
      error.response ? error.response.data : { message: "Network Error" }
    );
  }
);

export const signup = async (username: string, password: string) => {
  const response = await api.post("/signup", { username, password });
  return response.data;
};

export const login = async (username: string, password: string) => {
  const response = await api.post("/login", { username, password });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/current");
  return response.data;
};
