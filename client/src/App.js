import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./index.css"; // contains Tailwind CSS directives

const socket = io("http://localhost:5000");

function App() {
  const [u, setU] = useState("");
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [users, setUsers] = useState([]);
  const [notify, setNotify] = useState("");
  const [typing, setTyping] = useState("");

  useEffect(() => {
    socket.on("messageHistory", setMsgs);

    socket.on("message", m => {
      setMsgs(prev => [...prev, m]);
      new Audio("/notify.mp3").play().catch(() => {});
    });

    socket.on("notification", n => {
      setNotify(`${n.username} ${n.type === "join" ? "joined" : "left"}`);
      setTimeout(() => setNotify(""), 3000);
    });

    socket.on("users", setUsers);

    socket.on("typing", name => {
      setTyping(`${name} is typing...`);
      setTimeout(() => setTyping(""), 2000);
    });

    socket.on("privateMessage", pm => {
      alert(`PM from ${pm.from}: ${pm.message}`);
    });

    socket.on("reactionUpdate", ({ messageId, emoji }) => {
      setMsgs(prev => prev.map(m =>
        m._id === messageId
          ? { ...m, reactions: { ...m.reactions, [emoji]: (m.reactions[emoji] || 0) + 1 } }
          : m
      ));
    });

    return () => socket.removeAllListeners();
  }, []);

  const join = () => {
    if (u && room) {
      socket.emit("joinRoom", { username: u, room });
      setJoined(true);
    }
  };

  const send = () => {
    if (msg.trim()) {
      socket.emit("chatMessage", { username: u, room, message: msg });
      setMsg("");
    }
  };

  const sendPM = (to) => {
    const text = prompt(`PM to ${to}:`);
    if (text) socket.emit("privateMessage", { to, message: text });
  };

  const react = (id, e) => socket.emit("reactMessage", { messageId: id, emoji: e });

  const typingEvt = () => socket.emit("typing");

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-6 shadow rounded">
        {!joined ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Join Chat Room</h2>
            <input
              className="w-full mb-2 p-2 border rounded"
              placeholder="Username"
              value={u}
              onChange={e => setU(e.target.value)}
            />
            <input
              className="w-full mb-4 p-2 border rounded"
              placeholder="Room"
              value={room}
              onChange={e => setRoom(e.target.value)}
            />
            <button
              className="w-full bg-blue-600 text-white py-2 rounded"
              onClick={join}
            >
              Join
            </button>
          </>
        ) : (
          <>
            <h3 className="text-xl mb-2">Room: <span className="font-semibold">{room}</span></h3>
            <div className="text-sm text-gray-500 mb-2">
              Online: {users.join(", ")}
            </div>
            <div className="text-green-600 mb-2">{notify}</div>

            <div className="h-64 overflow-y-auto border p-2 mb-2 bg-gray-50">
              {msgs.map(m => (
                <div key={m._id} className="mb-2">
                  <strong>{m.username}</strong>{" "}
                  <span className="text-xs text-gray-400">
                    {new Date(m.timestamp).toLocaleTimeString()}
                  </span>
                  <div>{m.message}</div>
                  <div className="text-sm flex items-center gap-2">
                    <span>
                      👍 {m.reactions?.["👍"] || 0}{" "}
                      <button onClick={() => react(m._id, "👍")}>+</button>
                    </span>
                    <span>
                      ❤️ {m.reactions?.["❤️"] || 0}{" "}
                      <button onClick={() => react(m._id, "❤️")}>+</button>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-500 mb-2">{typing}</div>

            <input
              className="w-full mb-2 p-2 border rounded"
              placeholder="Type a message..."
              value={msg}
              onChange={e => setMsg(e.target.value)}
              onKeyDown={typingEvt}
            />
            <button
              className="w-full bg-green-600 text-white py-2 rounded"
              onClick={send}
            >
              Send
            </button>

            <div className="text-sm text-blue-600 mt-4">
              {users.filter(u2 => u2 !== u).map(u2 => (
                <button key={u2} className="mr-2" onClick={() => sendPM(u2)}>
                  PM {u2}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
