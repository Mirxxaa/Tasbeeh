import React, { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

const tasbeehOptions = [
  "Subhanallah",
  "hello",
  "Astagfirullah al Azeem",
  "Hasbunallahu Wa Ni'mal Wakeel",
  "La ilaha illa anta subhanaka inni kuntum minaz-zalimeen",
];

const VoiceCounter = () => {
  const [count, setCount] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [selectedTasbeeh, setSelectedTasbeeh] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [volume, setVolume] = useState(0); // To simulate sound level
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return <span>Your browser does not support speech recognition.</span>;
  }

  const startListening = () => {
    resetTranscript();
    setIsListening(true);
    SpeechRecognition.startListening({ continuous: true, language: "en-US" });
  };

  const stopListening = () => {
    setIsListening(false);
    SpeechRecognition.stopListening();
  };

  // Count matches of selected tasbeeh
  useEffect(() => {
    if (!selectedTasbeeh) return;
    const occurrences =
      transcript.toLowerCase().split(selectedTasbeeh.toLowerCase()).length - 1;
    setCount(occurrences);
  }, [transcript, selectedTasbeeh]);

  // Simulate sound bar movement based on the length of the transcript
  useEffect(() => {
    if (isListening) {
      setVolume(transcript.length % 50); // Adjust based on speech length
    }
  }, [transcript]);

  const handleSave = async () => {
    try {
      const docRef = await addDoc(collection(db, "voiceCounterSessions"), {
        count,
        tasbeeh: selectedTasbeeh,
        timestamp: new Date().toISOString(),
      });
      console.log("Saved voice session: ", docRef.id);
      setCount(0);
      resetTranscript();
      setSelectedTasbeeh("");
      setShowPopup(false);
      fetchSessions();
    } catch (e) {
      console.error("Error saving voice count: ", e);
    }
  };

  const fetchSessions = async () => {
    const snapshot = await getDocs(collection(db, "voiceCounterSessions"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setSessions(data);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="text-center">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Voice Counter</h1>
        <button
          onClick={() => setShowPopup(true)}
          className="bg-blue-500 px-4 py-2 text-white rounded"
        >
          +
        </button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Choose a Tasbeeh</h2>
            <ul className="space-y-2">
              {tasbeehOptions.map((tasbeeh, index) => (
                <li key={index}>
                  <button
                    onClick={() => {
                      setSelectedTasbeeh(tasbeeh);
                      setShowPopup(false);
                      startListening();
                    }}
                    className="w-full bg-gray-100 hover:bg-gray-200 p-2 rounded"
                  >
                    {tasbeeh}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {selectedTasbeeh && (
        <>
          <p className="text-lg mt-4">
            Selected: <strong>{selectedTasbeeh}</strong>
          </p>

          <div className="text-4xl my-4 font-bold">Count: {count}</div>

          {/* Sound bar */}
          <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
            <div
              className="bg-green-500 h-full"
              style={{
                width: `${(volume / 50) * 100}%`,
                transition: "width 0.2s ease",
              }}
            ></div>
          </div>

          <div className="space-x-4 mt-4">
            <button
              onClick={stopListening}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Stop
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              I’m Done
            </button>
          </div>
        </>
      )}

      <div className="mt-10 text-left">
        <h3 className="text-lg font-semibold mb-2">Saved Sessions:</h3>
        <ul className="bg-white rounded shadow p-4 space-y-2">
          {sessions.map((session) => (
            <li key={session.id} className="border-b pb-2">
              <div>
                <strong>{session.tasbeeh}</strong>
              </div>
              <div>Counted: {session.count}</div>
              <div className="text-xs text-gray-500">
                {new Date(session.timestamp).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VoiceCounter;
