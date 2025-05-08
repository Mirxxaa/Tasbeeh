import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import {
  FaStar,
  FaRegMoon,
  FaSun,
  FaPlus,
  FaCalendarAlt,
} from "react-icons/fa";

const tasbeehList = [
  {
    english: "Subhanallah",
    arabic: "سُبْحَانَ اللَّهِ",
    color: "emerald",
    icon: "moon",
  },
  {
    english: "Alhamdulillah",
    arabic: "الْحَمْدُ لِلَّهِ",
    color: "amber",
    icon: "sun",
  },
  {
    english: "Allahu Akbar",
    arabic: "اللَّهُ أَكْبَرُ",
    color: "sky",
    icon: "star",
  },
  {
    english: "Astagfirullah al Azeem",
    arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ",
    color: "purple",
    icon: "droplet",
  },
  {
    english: "Hasbunallahu Wa Ni'mal Wakeel",
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    color: "rose",
    icon: "shield",
  },
  {
    english: "La ilaha illa anta subhanaka Inni kuntum minaz-zalimeen",
    arabic:
      "لَا إِلٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    color: "teal",
    icon: "heart",
  },
];

const ButtonCounter = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [selectedTasbeeh, setSelectedTasbeeh] = useState("");
  const [theme, setTheme] = useState("light");
  const [expandedId, setExpandedId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [tasbeehCounts, setTasbeehCounts] = useState({});

  const [user, setUser] = useState(null); // Store the current user

  // State for confirmation dialog
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingTasbeeh, setPendingTasbeeh] = useState(null);

  const [loading, setLoading] = useState(false); // Loading state

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleKeyPress = (event) => {
    if (isModalOpen && (event.code === "Space" || event.code === "NumpadAdd")) {
      setCount((prev) => prev + 1);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isModalOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      const dropdown = document.getElementById("custom-dropdown-container");
      if (isDropdownOpen && dropdown && !dropdown.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Handle save and store Tasbeeh count
  const handleSave = async () => {
    if (!user) {
      alert("You must be logged in to save a Tasbeeh.");
      return;
    }

    if (!selectedTasbeeh) {
      alert("Please select a Tasbeeh before saving.");
      return;
    }

    if (count <= 0) {
      alert("Count must be greater than 0.");
      return;
    }

    try {
      // Save Tasbeeh under the current user
      await addDoc(collection(db, "buttonCounterSessions"), {
        uid: user.uid,
        tasbeeh: selectedTasbeeh.english,
        count: count,
        timestamp: new Date().toISOString(),
      });

      console.log("Tasbeeh saved successfully.");

      // Reset states
      setIsModalOpen(false);
      setCount(0);
      setSelectedTasbeeh("");

      // Refresh sessions immediately after saving
      fetchSessions();
    } catch (e) {
      console.error("Error adding Tasbeeh: ", e);
    }
  };

  const fetchSessions = async () => {
    if (!user) return;

    setLoading(true); // Start loading

    try {
      const q = query(
        collection(db, "buttonCounterSessions"),
        where("uid", "==", user.uid)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSessions(data); // Set sessions data
    } catch (error) {
      console.error("Error fetching sessions: ", error);
    } finally {
      setLoading(false); // Stop loading when done
    }
  };

  // Render loading spinner
  const renderLoading = () => {
    return <div className="loader">Loading...</div>;
  };

  // Render sessions data
  const renderSessions = () => {
    return (
      <div>
        {sessions.map((session) => (
          <div key={session.id}>
            <p>{session.tasbeeh}</p>
            <p>{session.count}</p>
          </div>
        ))}
      </div>
    );
  };

  // Handle login state: This useEffect sets the user when logged in or logged out.
  useEffect(() => {
    const currentUser = auth.currentUser;
    setUser(currentUser); // Set user whenever the user is logged in/out
  }, []); // This runs once on component mount to check if a user is logged in

  // Fetch data when the user is logged in
  useEffect(() => {
    if (user) {
      fetchSessions(); // Fetch sessions only when the user is logged in
    }
  }, [user]); // This will trigger every time `user` changes

  // Ensure fetchSessions runs on component load or when user changes
  useEffect(() => {
    fetchSessions();
  }, []);

  // Helper function to get color class based on tasbeeh type
  const getColorClass = (tasbeehName) => {
    const tasbeeh = tasbeehList.find((t) => t.english === tasbeehName);
    if (!tasbeeh) return "emerald";

    return tasbeeh.color;
  };

  // Icons for tasbeeh types
  const IconComponent = ({ type }) => {
    // Find tasbeeh in the list
    const tasbeeh = tasbeehList.find((t) => t.english === type);
    const iconType = tasbeeh?.icon || "circle";

    switch (iconType) {
      case "moon":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        );
      case "sun":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        );
      case "star":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      case "droplet":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5-2 1.6-3 3.5-3 5.5a7 7 0 0 0 7 7z" />
          </svg>
        );
      case "shield":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        );
      case "heart":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
    }
  };

  // Islamic geometric pattern SVG for background decoration
  const PatternDecoration = () => (
    <div className="absolute opacity-5 right-0 top-0 h-full w-1/2 overflow-hidden pointer-events-none">
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <pattern
            id="islamicPattern"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0,20 L40,20 M20,0 L20,40"
              stroke="currentColor"
              strokeWidth="1"
            />
            <circle
              cx="20"
              cy="20"
              r="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <circle
              cx="20"
              cy="20"
              r="7.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
            <path
              d="M5,20 A15,15 0 0,1 35,20"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
            />
            <path
              d="M35,20 A15,15 0 0,1 5,20"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamicPattern)" />
      </svg>
    </div>
  );

  return (
    <div
      className={`relative min-h-[80vh] p-8 overflow-hidden rounded-xl transition-colors duration-300 ${
        theme === "dark"
          ? "bg-slate-900 text-white"
          : "bg-gradient-to-br from-emerald-50 to-teal-100 text-slate-800"
      }`}
    >
      <PatternDecoration />

      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-1 0">
          <span className="inline-block  ">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full hover:bg-opacity-10 hover:bg-slate-700 transition-colors ${
                theme === "dark" ? "text-yellow-300" : "text-slate-700"
              }`}
            >
              {theme === "dark" ? <FaSun /> : <FaRegMoon />}
            </button>
          </span>

          <h1 className="lg:text-xl md:text-lg text-md justify-center font-semibold flex items-center gap-2">
            Tasbeeh Journal
          </h1>
        </div>
        <div className="flex">
          <button
            className={`text-sm font-medium p-2 lg:px-4 flex items-center justify-center rounded-full shadow-md transition-all duration-300 ${
              theme === "dark"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
            onClick={() => setIsModalOpen(true)}
          >
            <FaPlus className="text-lg" />
            <span className="ml-2 hidden md:inline">Start Tasbeeh</span>
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div
        className={`p-6 rounded-lg shadow-lg relative z-10 transition-colors duration-300 ${
          theme === "dark"
            ? "bg-slate-800 border border-slate-700"
            : "bg-white bg-opacity-80 backdrop-blur-sm"
        }`}
      >
        <h2 className="text-sm font-semibold mb-4 gap-2 flex items-center">
          <FaCalendarAlt />
          Your Tasbeeh Records
        </h2>

        {sessions.length === 0 ? (
          <div
            className={`text-center py-12 ${
              theme === "dark" ? "text-slate-400" : "text-slate-500"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-3 opacity-50"
            >
              <path d="M16.5 9.4l-9-5.19" />
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <path d="M3.27 6.96L12 12.01l8.73-5.05" />
              <path d="M12 22.08V12" />
            </svg>
            <p>No count sessions yet. Start your first tasbeeh session!</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {sessions.map((session) => {
              const colorName = getColorClass(session.tasbeeh);
              let colorClass = "text-emerald-600";
              let bgColorClass = "bg-emerald-50";
              let borderColorClass = "border-emerald-200";

              switch (colorName) {
                case "emerald":
                  colorClass =
                    theme === "dark" ? "text-emerald-400" : "text-emerald-600";
                  bgColorClass =
                    theme === "dark"
                      ? "bg-emerald-900 bg-opacity-30"
                      : "bg-emerald-50";
                  borderColorClass =
                    theme === "dark"
                      ? "border-emerald-800"
                      : "border-emerald-200";
                  break;
                case "amber":
                  colorClass =
                    theme === "dark" ? "text-amber-400" : "text-amber-600";
                  bgColorClass =
                    theme === "dark"
                      ? "bg-amber-900 bg-opacity-30"
                      : "bg-amber-50";
                  borderColorClass =
                    theme === "dark" ? "border-amber-800" : "border-amber-200";
                  break;
                case "sky":
                  colorClass =
                    theme === "dark" ? "text-sky-400" : "text-sky-600";
                  bgColorClass =
                    theme === "dark" ? "bg-sky-900 bg-opacity-30" : "bg-sky-50";
                  borderColorClass =
                    theme === "dark" ? "border-sky-800" : "border-sky-200";
                  break;
                case "purple":
                  colorClass =
                    theme === "dark" ? "text-purple-400" : "text-purple-600";
                  bgColorClass =
                    theme === "dark"
                      ? "bg-purple-900 bg-opacity-30"
                      : "bg-purple-50";
                  borderColorClass =
                    theme === "dark"
                      ? "border-purple-800"
                      : "border-purple-200";
                  break;
                case "rose":
                  colorClass =
                    theme === "dark" ? "text-rose-400" : "text-rose-600";
                  bgColorClass =
                    theme === "dark"
                      ? "bg-rose-900 bg-opacity-30"
                      : "bg-rose-50";
                  borderColorClass =
                    theme === "dark" ? "border-rose-800" : "border-rose-200";
                  break;
                case "teal":
                  colorClass =
                    theme === "dark" ? "text-teal-400" : "text-teal-600";
                  bgColorClass =
                    theme === "dark"
                      ? "bg-teal-900 bg-opacity-30"
                      : "bg-teal-50";
                  borderColorClass =
                    theme === "dark" ? "border-teal-800" : "border-teal-200";
                  break;
              }

              return (
                <li
                  key={session.id}
                  className={`border rounded-lg overflow-hidden transition-all duration-300 ${
                    theme === "dark"
                      ? "border-slate-700 hover:border-slate-600"
                      : "hover:shadow-md"
                  } ${borderColorClass}`}
                  onClick={() => toggleExpand(session.id)}
                >
                  <div
                    className={`flex items-center justify-between p-4 cursor-pointer ${colorClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent type={session.tasbeeh} />
                      <div>
                        <span className="font-medium text-sm">
                          {session.tasbeeh.split(" ").slice(0, 4).join(" ")}
                          {session.tasbeeh.split(" ").length > 4 && "..."}
                        </span>
                        {expandedId !== session.id && (
                          <span
                            className={`text-xs block ${
                              theme === "dark"
                                ? "text-slate-400"
                                : "text-slate-500"
                            }`}
                          >
                            {new Date(session.timestamp).toLocaleString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`flex items-center justify-center h-12 w-12 rounded-full ${
                        theme === "dark" ? "bg-slate-700" : bgColorClass
                      } font-bold text-lg`}
                    >
                      {session.count}
                    </div>
                  </div>

                  {expandedId === session.id && (
                    <div
                      className={`p-4 text-sm border-t ${
                        theme === "dark"
                          ? "border-slate-700 bg-slate-800"
                          : `${borderColorClass} ${bgColorClass}`
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span
                            className={
                              theme === "dark"
                                ? "text-slate-300"
                                : "text-slate-600"
                            }
                          >
                            {new Date(session.timestamp).toLocaleString(
                              undefined,
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 backdrop-blur-sm">
          <div
            className={`rounded-t-4xl p-8  h-[80vh] absolute bottom-0 w-full shadow-2xl transition-colors ${
              theme === "dark"
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-800"
            }`}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4">
                <svg
                  viewBox="0 0 100 100"
                  className={`w-full h-full ${
                    selectedTasbeeh
                      ? getColorClass(selectedTasbeeh.english) === "emerald"
                        ? "text-emerald-500"
                        : getColorClass(selectedTasbeeh.english) === "amber"
                        ? "text-amber-500"
                        : getColorClass(selectedTasbeeh.english) === "sky"
                        ? "text-sky-500"
                        : getColorClass(selectedTasbeeh.english) === "purple"
                        ? "text-purple-500"
                        : getColorClass(selectedTasbeeh.english) === "rose"
                        ? "text-rose-500"
                        : getColorClass(selectedTasbeeh.english) === "teal"
                        ? "text-teal-500"
                        : "text-emerald-500"
                      : "text-emerald-500"
                  }`}
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M50,5 L50,15 M5,50 L15,50 M50,95 L50,85 M95,50 L85,50"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="25"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold">Tasbeeh Counter</h2>
            </div>

            {/* Display Arabic Text for Selected Tasbeeh */}
            {selectedTasbeeh && (
              <div className="text-center mb-6">
                <p className="text-2xl font-arabic tracking-wider">
                  {selectedTasbeeh.arabic}
                </p>
                <p className="text-sm mt-1">{selectedTasbeeh.english}</p>
              </div>
            )}

            {/* Animated Tasbeeh Dropdown */}
            <div className="mb-6">
              <div
                id="custom-dropdown-container"
                className={`relative rounded-lg border ${
                  theme === "dark" ? "border-slate-600" : "border-slate-200"
                }`}
              >
                <div
                  className={`relative ${
                    theme === "dark" ? "bg-slate-700" : "bg-slate-50"
                  } group cursor-pointer`}
                >
                  <div
                    className="select-wrapper flex items-center w-full px-4 py-3 appearance-none focus:outline-none"
                    onClick={toggleDropdown}
                  >
                    <div
                      className={`flex-grow ${
                        theme === "dark" ? "text-white" : "text-slate-800"
                      } ${!selectedTasbeeh ? "opacity-60" : ""}`}
                    >
                      {selectedTasbeeh ? (
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-5 h-5 flex items-center justify-center ${
                              getColorClass(selectedTasbeeh.english) ===
                              "emerald"
                                ? "text-emerald-500"
                                : getColorClass(selectedTasbeeh.english) ===
                                  "amber"
                                ? "text-amber-500"
                                : getColorClass(selectedTasbeeh.english) ===
                                  "sky"
                                ? "text-sky-500"
                                : getColorClass(selectedTasbeeh.english) ===
                                  "purple"
                                ? "text-purple-500"
                                : getColorClass(selectedTasbeeh.english) ===
                                  "rose"
                                ? "text-rose-500"
                                : "text-teal-500"
                            }`}
                          >
                            <IconComponent type={selectedTasbeeh.english} />
                          </div>
                          <span>{selectedTasbeeh.english}</span>
                        </div>
                      ) : (
                        "Select a Tasbeeh"
                      )}
                    </div>
                    <div
                      className={`transition-transform duration-300 transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* This is the fixed dropdown list container */}
                {isDropdownOpen && (
                  <div
                    className={`absolute left-0 right-0 z-50 mt-1 shadow-lg rounded-lg ${
                      theme === "dark" ? "bg-slate-800" : "bg-white"
                    }`}
                    style={{
                      maxHeight: "240px",
                      overflowY: "auto",
                      width: "100%",
                      top: "100%", // Ensure it's positioned right below the dropdown trigger
                    }}
                  >
                    {tasbeehList && tasbeehList.length > 0 ? (
                      tasbeehList.map((tasbeeh, idx) => (
                        <div
                          key={idx}
                          className={`px-4 py-3 cursor-pointer transition-all duration-200 ${
                            selectedTasbeeh &&
                            selectedTasbeeh.english === tasbeeh.english
                              ? theme === "dark"
                                ? "bg-slate-600 text-white"
                                : "bg-emerald-100 text-emerald-800"
                              : theme === "dark"
                              ? "bg-slate-700 text-white hover:bg-slate-600"
                              : "bg-white text-slate-800 hover:bg-slate-100"
                          }`}
                          onClick={() => {
                            setSelectedTasbeeh(tasbeeh);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-6 h-6 flex items-center justify-center ${
                                getColorClass(tasbeeh.english) === "emerald"
                                  ? "text-emerald-500"
                                  : getColorClass(tasbeeh.english) === "amber"
                                  ? "text-amber-500"
                                  : getColorClass(tasbeeh.english) === "sky"
                                  ? "text-sky-500"
                                  : getColorClass(tasbeeh.english) === "purple"
                                  ? "text-purple-500"
                                  : getColorClass(tasbeeh.english) === "rose"
                                  ? "text-rose-500"
                                  : "text-teal-500"
                              }`}
                            >
                              <IconComponent type={tasbeeh.english} />
                            </div>
                            <div>
                              <div className="font-medium">
                                {tasbeeh.english}
                              </div>
                              <div className="text-xs opacity-70 font-arabic">
                                {tasbeeh.arabic}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-center opacity-70">
                        No tasbeeh options available
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Show selected tasbeeh animation indicator */}
              {selectedTasbeeh && (
                <div
                  className="mt-2 flex items-center justify-center gap-2 opacity-0 animate-fade-in"
                  style={{ animation: "fadeIn 0.5s forwards" }}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      getColorClass(selectedTasbeeh.english) === "emerald"
                        ? "bg-emerald-500"
                        : getColorClass(selectedTasbeeh.english) === "amber"
                        ? "bg-amber-500"
                        : getColorClass(selectedTasbeeh.english) === "sky"
                        ? "bg-sky-500"
                        : getColorClass(selectedTasbeeh.english) === "purple"
                        ? "bg-purple-500"
                        : getColorClass(selectedTasbeeh.english) === "rose"
                        ? "bg-rose-500"
                        : "bg-teal-500"
                    } animate-pulse`}
                  ></div>
                  <span className="text-xs opacity-60">
                    Tap the counter button or press Space to count
                  </span>
                </div>
              )}

              <style jsx>{`
                @keyframes fadeIn {
                  from {
                    opacity: 0;
                    transform: translateY(-10px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>
            </div>

            {/* Count Button */}
            <button
              className={`relative w-full gap-2 h-[15vh] p-8 mb-6 rounded-xl flex flex-col items-center justify-center shadow-lg transition-all duration-300 transform active:scale-95 text-white ${
                selectedTasbeeh
                  ? getColorClass(selectedTasbeeh.english) === "emerald"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : getColorClass(selectedTasbeeh.english) === "amber"
                    ? "bg-amber-500 hover:bg-amber-600"
                    : getColorClass(selectedTasbeeh.english) === "sky"
                    ? "bg-sky-500 hover:bg-sky-600"
                    : getColorClass(selectedTasbeeh.english) === "purple"
                    ? "bg-purple-500 hover:bg-purple-600"
                    : getColorClass(selectedTasbeeh.english) === "rose"
                    ? "bg-rose-500 hover:bg-rose-600"
                    : getColorClass(selectedTasbeeh.english) === "teal"
                    ? "bg-teal-500 hover:bg-teal-600"
                    : "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-emerald-500 hover:bg-emerald-600"
              }`}
              onClick={() => setCount((prev) => prev + 1)}
            >
              <span className="text-4xl font-bold">{count}</span>
              <span className="  text-xs opacity-70">Tap to count</span>
            </button>

            <p className="text-center text-sm mb-4 opacity-70">
              Use <strong>Space</strong> or <strong>Numpad +</strong> to count
            </p>

            <div className="flex gap-3">
              {/* Cancel Button */}
              <button
                className={`flex-1 px-4 py-3 rounded-lg border font-medium ${
                  theme === "dark"
                    ? "border-slate-600 hover:bg-slate-700"
                    : "border-slate-200 hover:bg-slate-100"
                }`}
                onClick={() => {
                  setIsModalOpen(false);
                  setCount(0);
                  setSelectedTasbeeh(null);
                }}
              >
                Cancel
              </button>

              {/* Save Button */}
              <button
                className={`flex-1 px-4 py-3 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-700 text-white`}
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ButtonCounter;
