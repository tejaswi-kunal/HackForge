import { Route, Routes, Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { checkUser } from "./redux/authSlice";

import Homepage from "./pages/Homepage";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Problem from "./pages/Problem"; 
import ProblemSubmit from "./pages/ProblemSubmit";

import Profile from "./pages/Profile";
import EditProfile from "./pages/Settings/EditProfile";
import ChangePassword from "./pages/Settings/ChangePassword";

// NEW IMPORTS
import Leaderboard from "./pages/Leaderboard";
import PublicProfile from "./pages/PublicProfile";

function App() {
  const { isAuthenticated, loading } = useSelector((state) => state.authSlice);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkUser());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-[#C9963A]"></span>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Homepage /> : <Navigate to={'/login'} />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to={'/'} /> : <SignUp />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to={'/'} /> : <Login />} />
      
      <Route path="/problems" element={!isAuthenticated ? <Navigate to={'/login'} /> : <Problem />} />
      <Route path="/problem/:id" element={!isAuthenticated ? <Navigate to={'/login'} /> : <ProblemSubmit />} />

      <Route path="/profile" element={!isAuthenticated ? <Navigate to={'/login'} /> : <Profile />} />
      <Route path="/settings/edit-profile" element={!isAuthenticated ? <Navigate to={'/login'} /> : <EditProfile />} />
      <Route path="/settings/change-password" element={!isAuthenticated ? <Navigate to={'/login'} /> : <ChangePassword />} />

      {/* NEW ROUTES */}
      <Route path="/leaderboard" element={!isAuthenticated ? <Navigate to={'/login'} /> : <Leaderboard />} />
      {/* Public profile route using URL parameter */}
      <Route path="/profile/:id" element={!isAuthenticated ? <Navigate to={'/login'} /> : <PublicProfile />} />
    </Routes>
  );
}

export default App;