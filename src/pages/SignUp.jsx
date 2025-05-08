import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [isSecuritySet, setIsSecuritySet] = useState(false); // State to toggle between signup and security question form
  const navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update display name
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Optional: Save user info in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        phone,
        email,
        securityQuestion,
        securityAnswer, // Store security question and answer
      });

      navigate("/dashboard"); // Redirect to dashboard after signup
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSecurityQuestions = () => {
    setIsSecuritySet(true); // Move to the security question page
  };

  // Navigate to the Login page
  const handleLoginPage = () => {
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Register</h2>

      {!isSecuritySet ? (
        <>
          <input
            type="text"
            placeholder="Name"
            className="border p-2 mb-2 w-full max-w-xs"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Phone"
            className="border p-2 mb-2 w-full max-w-xs"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email ID"
            className="border p-2 mb-2 w-full max-w-xs"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 mb-4 w-full max-w-xs"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleSecurityQuestions}
            className="bg-green-600 text-white px-4 py-2 rounded mb-2"
          >
            Next: Set Security Questions
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Security Question (e.g., Your first pet's name)"
            className="border p-2 mb-2 w-full max-w-xs"
            value={securityQuestion}
            onChange={(e) => setSecurityQuestion(e.target.value)}
          />
          <input
            type="text"
            placeholder="Security Answer"
            className="border p-2 mb-4 w-full max-w-xs"
            value={securityAnswer}
            onChange={(e) => setSecurityAnswer(e.target.value)}
          />
          <button
            onClick={handleSignUp}
            className="bg-green-600 text-white px-4 py-2 rounded mb-2"
          >
            Sign Up
          </button>
        </>
      )}

      {/* Button to navigate to Login Page */}
      <button
        onClick={handleLoginPage}
        className="text-blue-600 mt-4 cursor-pointer"
      >
        Already have an account? Login here
      </button>
    </div>
  );
};

export default SignUp;
