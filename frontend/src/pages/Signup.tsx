import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { signup } from "../utils/AuthAPIHandler";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await signup(username, password);
      navigate("/login");
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
        onSubmit={handleSignup}
        className="bg-primary-a2 p-6 rounded-lg w-80"
      >
        <h1 className="text-4xl mb-4 text-center font-bold">Sign Up</h1>
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
        <label htmlFor="confirmPassword" className="text-2xl mb-1">
          Confirm Password
        </label>
        <div className="w-full mb-2 flex flex-row">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Re-enter your password"
            className="w-full p-2 rounded-l-lg border"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="p-2 rounded-r-lg text-2xl hover:scale-105 transition-transform"
          >
            {showConfirmPassword ? <IoEyeOff /> : <IoEye />}
          </button>
        </div>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <button
          type="submit"
          className="w-full bg-primary-a1 text-white p-2 hover:bg-primary-a0 transition-colors rounded-lg font-bold"
        >
          Sign Up
        </button>
        <p className="mt-2 text-center">
          Already have an account?{" "}
          <Link to="/login" className="hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
