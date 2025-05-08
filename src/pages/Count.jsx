import React, { useState } from "react";
import { signOut } from "firebase/auth"; // Import signOut from Firebase
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import { auth } from "../firebase"; // Import your Firebase auth instance
import ButtonCounter from "../components/ButtonCounter";
import VoiceCounter from "../components/VoiceCounter";

const Count = () => {
  const [activeTab, setActiveTab] = useState("button");
  const navigate = useNavigate(); // Hook to navigate to different routes

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth); // Log the user out
      console.log("User logged out successfully");
      navigate("/login"); // Redirect to the login page
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  return (
    <div className="p-8 bg-[#D0D6B3] h-screen mx-auto">
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setActiveTab("button")}
          className={`px-4 py-2 border-b-2 text-lg font-medium ${
            activeTab === "button"
              ? "border-black text-black cursor-pointer"
              : "border-transparent text-gray-500 hover:text-black cursor-pointer"
          }`}
        >
          Button Counter
        </button>
        <button
          onClick={() => setActiveTab("voice")}
          className={`ml-4 px-4 py-2 border-b-2 text-lg font-medium ${
            activeTab === "voice"
              ? "border-black text-black cursor-pointer"
              : "border-transparent text-gray-500 hover:text-black cursor-pointer"
          }`}
        >
          Voice Counter
        </button>
      </div>

      {/* Render the corresponding counter component */}
      {activeTab === "button" ? <ButtonCounter /> : <VoiceCounter />}

      {/* Logout Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Count;
