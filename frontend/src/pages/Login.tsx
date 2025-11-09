import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { login } from "../utils/AuthAPIHandler";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate("/");
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "An unknown error occurred";
      setError(errorMessage);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-primary-a3 text-primary-a4">
      <form
        onSubmit={handleLogin}
        className="bg-primary-a2 p-6 rounded-lg w-80"
      >
        <h1 className="text-4xl mb-4 text-center font-bold">Login</h1>
        <label htmlFor="username" className="text-2xl mb-1">
          Username
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="Enter your username"
          className="w-full p-2 mb-2 rounded-lg border"
        />
        <label htmlFor="password" className="text-2xl mb-1">
          Password
        </label>
        <div className="w-full mb-2 flex flex-row">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            className="w-full p-2 rounded-l-lg border"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-2 rounded-r-lg text-2xl hover:scale-105 transition-transform"
          >
            {showPassword ? <IoEyeOff /> : <IoEye />}
          </button>
        </div>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <button
          type="submit"
          className="w-full bg-primary-a1 text-white p-2 hover:bg-primary-a0 transition-colors rounded-lg font-bold"
        >
          Login
        </button>
        <p className="mt-2 text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="hover:underline">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
