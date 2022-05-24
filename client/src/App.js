import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import io from "socket.io-client";
import Picker from "emoji-picker-react";
const socket = io("http://localhost:5000");

function App() {
  const [socketId, setSocketId] = useState("");
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [room, setRoom] = useState("");
  const [chat, setChat] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  //Emoji

  const onEmojiClick = (event, emojiObject) => {
    setMessage(message + emojiObject.emoji);
  };
  // scroll
  const chatContainer = useRef(null);

  useEffect(() => {
    socket.on("me", (id) => {
      setSocketId(id);
    });

    socket.on("disconnect", () => {
      socket.disconnect();
    });

    socket.on("getAllUsers", (users) => {
      setUsers(users);
    });
    // Real time
    socket.on("updateUsers", (users) => {
      setUsers(users);
    });

    socket.on("getAllRooms", (rooms) => {
      setRooms(rooms);
    });
    // Real time
    socket.on("updateRooms", (rooms) => {
      setRooms(rooms);
    });

    // Rooms

    socket.on("chat", (payload) => {
      setChat(payload.chat);
    });

    if (joinedRoom === true) {
      chatContainer.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [chat, rooms]);

  const sendMessage = async () => {
    const payload = { message, room, socketId };
    socket.emit("message", payload);

    setMessage("");
    socket.on("chat", (payloadd) => {
      setChat(payloadd.chat);
      // console.log(payloadd.chat);
      console.log(payloadd);
    });
    chatContainer.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
    setShowEmoji(false);
  };

  const createRoom = () => {
    socket.emit("create_room");
    socket.on("get_room", (room) => {
      setRooms([...rooms, room]);
    });
  };

  const joinRoom = (room) => {
    socket.emit("join_room", room);
    setRoom(room.id);
    setJoinedRoom(true);
    //
    setChat(room.chat);
  };

  return (
    <>
      <h1 className="main_heading">Chat App</h1>
      <h1 className="my_socket">Me: {socketId}</h1>
      <h3 className="roomjoined">
        {joinedRoom === true
          ? `Room: ${room}`
          : "You are not joined in any room"}
      </h3>

      {!joinedRoom && (
        <div className="container">
          <div className="users-container">
            <h2 className="users_heading">Online Users:</h2>
            <ul className="users">
              {users.map((user) => {
                return (
                  <li className="user" key={user}>
                    {user && user === socketId ? `*ME*` : user}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="rooms-container">
            <h2 className="rooms_heading">Available Rooms:</h2>

            {rooms.length === 0 ? (
              <h3 className="no_rooms">No Rooms! Create a room !</h3>
            ) : (
              <ul className="rooms">
                {rooms.map((room) => {
                  return (
                    <li key={room.id} onClick={() => joinRoom(room)}>
                      {room.id}
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="btn-container">
              <button className="btn" onClick={() => createRoom()}>
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}

      {joinedRoom && (
        <>
          <div className="chat-container">
            <ul className="chat-list" id="chat-list" ref={chatContainer}>
              {chat.map((chat, idx) => (
                <li
                  key={idx}
                  className={chat.writer === socketId ? "chat-me" : "chat-user"}
                >
                  {chat.writer === socketId
                    ? `${chat.message}: ME*`
                    : `User (${chat.writer.slice(0, 5)}): ${chat.message}`}
                </li>
              ))}
            </ul>
          </div>

          <form className="chat-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Your message ..."
              autoFocus
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              value={message}
            />

            <button
              className="emoji_btn"
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
            >
              Emoji
            </button>
            <button
              className="send_btn"
              type="submit"
              onClick={() => sendMessage()}
            >
              Send
            </button>
          </form>
          {showEmoji && (
            <Picker
              onEmojiClick={onEmojiClick}
              pickerStyle={{
                width: "20%",
                display: "absolute",
                left: "0",
                bottom: "270px",
                backgroundColor: "#fff",
              }}
            />
          )}
        </>
      )}
    </>
  );
}

export default App;
