import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import AuthenticatedRoute from "./utils/AuthenticatedRoute";
import Home from "./pages/Home";
import Match from "./pages/Match";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const { user, getUser } = useAuth();

  useEffect(() => {
    if (user === undefined) {
      getUser();
    }
  }, [user, getUser]);
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route element={<AuthenticatedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/match/:matchId" element={<Match />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
