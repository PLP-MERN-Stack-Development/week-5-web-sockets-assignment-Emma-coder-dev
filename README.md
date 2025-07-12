```markdown
# 💬 Real-Time Chat Application

This is a real-time chat application built using **Node.js**, **Express**, **Socket.io**, **React**, and **MongoDB**. The app allows users to join chat rooms with a username and room name, exchange messages live, and view typing status updates in real time. Messages are stored in a MongoDB database.

---

## 🚀 Tech Stack

| Layer    | Technology                     |
|----------|--------------------------------|
| Frontend | React, Tailwind CSS            |
| Backend  | Node.js, Express.js, Socket.io |
| Database | MongoDB, Mongoose              |

---

## ✅ Features

- Users join using a **username** and **room name**
- **Real-time messaging** using Socket.io
- **Typing indicators** shown when a user is typing
- Messages show the **sender's name**
- **Persistent message history** via MongoDB
- Display all previous messages upon joining a room
- Responsive UI with **Tailwind CSS**

---

## 📁 Project Structure

```
socketio-chat/
├── client/
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
├── server/
│   ├── server.js
│   └── models/
│       └── Message.js
├── README.md
├── .env
```

---

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/socketio-chat.git
cd socketio-chat
```

### 2. Setup the server
```bash
cd server
npm install
```

Create a `.env` file and add:
```
MONGO_URI=mongodb://localhost:27017/chatDB
```

Then start the server:
```bash
npm run dev
```

### 3. Setup the client
```bash
cd client
npm install
npm run dev
```

Open your browser at `http://localhost:3000`

---

## ✍️ Author

This project was built as part of a **real-time communication assignment** in Week 5.

---

## 📄 License

This project is licensed under the MIT License.
```
