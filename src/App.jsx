import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth"; // Firebase method to track auth state
import { auth } from "./firebase"; // Import the firebase auth instance
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Count from "./pages/Count"; // Dashboard

const App = () => {
  const [user, setUser] = useState(null);

  // Listen to the user's authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update state with current user
    });

    return () => unsubscribe(); // Clean up subscription on component unmount
  }, []);

  return (
    <Router>
      <Routes>
        {/* If the user is logged in, redirect to the dashboard */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <SignUp />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/dashboard" /> : <SignUp />}
        />
        <Route
          path="/dashboard"
          element={user ? <Count /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
