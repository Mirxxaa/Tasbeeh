import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [userSecurityQuestion, setUserSecurityQuestion] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleForgotPassword = async () => {
    try {
      // Directly querying Firestore for the user's document by email (or UID if it's stored in Firebase Auth)
      const docRef = doc(db, "users", email); // Assuming you're using the email as the document ID
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // If user exists, retrieve the security question
        setUserSecurityQuestion(docSnap.data().securityQuestion);
        setIsForgotPassword(true);
      } else {
        alert("No user found with this email");
      }
    } catch (error) {
      console.error("Error retrieving user:", error.message);
      alert("Error retrieving user: " + error.message);
    }
  };

  const handleResetPassword = async () => {
    try {
      const docRef = doc(db, "users", email); // Ensure correct reference by email
      const docSnap = await getDoc(docRef);

      if (
        docSnap.exists() &&
        docSnap.data().securityAnswer === securityAnswer
      ) {
        // Reset the password if the security answer matches
        await auth.currentUser.updatePassword(newPassword);
        alert("Password updated successfully!");
        navigate("/login");
      } else {
        alert("Incorrect security answer");
      }
    } catch (error) {
      alert("Error resetting password: ", error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Login</h2>

      {!isForgotPassword ? (
        <>
          <input
            type="email"
            className="border p-2 mb-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="border p-2 mb-2"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleLogin}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Login
          </button>
          <button onClick={handleForgotPassword} className="text-blue-600 mt-2">
            Forgot Password?
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="text-blue-600 mt-2"
          >
            Sign Up
          </button>
        </>
      ) : (
        <>
          <p>{userSecurityQuestion}</p>
          <input
            type="text"
            placeholder="Answer the security question"
            className="border p-2 mb-2"
            value={securityAnswer}
            onChange={(e) => setSecurityAnswer(e.target.value)}
          />
          <input
            type="password"
            placeholder="New Password"
            className="border p-2 mb-2"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            onClick={handleResetPassword}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Reset Password
          </button>
        </>
      )}
    </div>
  );
};

export default Login;
