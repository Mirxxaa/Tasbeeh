import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0); // 0: Login, 1: Enter Email, 2: Answer Question, 3: Reset Password
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [userSecurityQuestion, setUserSecurityQuestion] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [userId, setUserId] = useState(""); // Store user ID from Firestore
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setErrorMessage("");
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleStartForgotPassword = () => {
    setForgotPasswordStep(1);
    setErrorMessage("");
  };

  const handleFindAccount = async () => {
    try {
      setErrorMessage("");

      // First, try to find user document by email field using Firebase v9 syntax
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const snapshot = await getDocs(q);

      if (!snapshot.empty && snapshot.docs.length > 0) {
        // Get the first matching document
        const userDoc = snapshot.docs[0];
        setUserId(userDoc.id);
        setUserSecurityQuestion(userDoc.data().securityQuestion);
        setForgotPasswordStep(2); // Move to security question step
      } else {
        setErrorMessage("No account found with this email address");
      }
    } catch (error) {
      console.error("Error retrieving user:", error);
      setErrorMessage("Error retrieving account information");
    }
  };

  const handleVerifySecurityAnswer = async () => {
    try {
      setErrorMessage("");

      // Get the user document
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        // Compare security answer (case insensitive)
        const storedAnswer = userDoc.data().securityAnswer.toLowerCase();
        const providedAnswer = securityAnswer.toLowerCase();

        if (storedAnswer === providedAnswer) {
          setForgotPasswordStep(3); // Move to reset password step
        } else {
          setErrorMessage("Incorrect security answer");
        }
      } else {
        setErrorMessage("User account no longer exists");
      }
    } catch (error) {
      console.error("Error verifying security answer:", error);
      setErrorMessage("Error verifying security answer");
    }
  };

  const handleResetPassword = async () => {
    try {
      setErrorMessage("");

      // Verify the security answer is correct first
      const userRef = doc(db, "users", userId);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const storedAnswer = userSnapshot.data().securityAnswer.toLowerCase();
        const providedAnswer = securityAnswer.toLowerCase();

        if (storedAnswer === providedAnswer) {
          // Update the password in Firestore
          await updateDoc(userRef, {
            password: newPassword,
          });

          // Send password reset email as well (this is the recommended way)
          await sendPasswordResetEmail(auth, email);

          alert(
            "Password reset link sent to your email. You can also log in with your new password now."
          );
          setForgotPasswordStep(0); // Return to login
          setPassword(""); // Clear password field
        } else {
          setErrorMessage("Incorrect security answer");
        }
      } else {
        setErrorMessage("User account no longer exists");
      }
    } catch (error) {
      console.error("Error in password reset process:", error);
      setErrorMessage("Error during password reset: " + error.message);
    }
  };

  const renderContent = () => {
    switch (forgotPasswordStep) {
      case 1: // Enter Email
        return (
          <>
            <h3 className="mb-4">Find Your Account</h3>
            <input
              type="email"
              className="border p-2 mb-2 w-full max-w-xs"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setForgotPasswordStep(0)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleFindAccount}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Find Account
              </button>
            </div>
          </>
        );

      case 2: // Answer Security Question
        return (
          <>
            <h3 className="mb-4">Security Verification</h3>
            <p className="mb-2">Please answer your security question:</p>
            <p className="font-medium mb-4">{userSecurityQuestion}</p>
            <input
              type="text"
              className="border p-2 mb-2 w-full max-w-xs"
              placeholder="Your answer"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setForgotPasswordStep(1)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
              >
                Back
              </button>
              <button
                onClick={handleVerifySecurityAnswer}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Verify
              </button>
            </div>
          </>
        );

      case 3: // Reset Password
        return (
          <>
            <h3 className="mb-4">Reset Your Password</h3>
            <input
              type="password"
              className="border p-2 mb-2 w-full max-w-xs"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              className="border p-2 mb-2 w-full max-w-xs"
              placeholder="Confirm new password"
              // Add validation that passwords match
            />
            <div className="flex gap-2">
              <button
                onClick={() => setForgotPasswordStep(2)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
              >
                Back
              </button>
              <button
                onClick={handleResetPassword}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Reset Password
              </button>
            </div>
          </>
        );

      default: // Login (step 0)
        return (
          <>
            <input
              type="email"
              className="border p-2 mb-2 w-full max-w-xs"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="border p-2 mb-2 w-full max-w-xs"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full max-w-xs"
            >
              Login
            </button>
            <button
              onClick={handleStartForgotPassword}
              className="text-blue-600 mt-2"
            >
              Forgot Password?
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="text-blue-600 mt-2"
            >
              Sign Up
            </button>
          </>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Login</h2>

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 w-full max-w-xs">
          {errorMessage}
        </div>
      )}

      {renderContent()}
    </div>
  );
};

export default Login;
