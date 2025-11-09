import axios from "axios";

const apiURL = window.location.origin;
const api = axios.create({
  baseURL: `${apiURL}/api/match`,
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

export const createMatch = async () => {
  const response = await api.post("/create");
  return response.data;
};

export const getAllMatches = async () => {
  const response = await api.get("/all");
  return response.data;
};
