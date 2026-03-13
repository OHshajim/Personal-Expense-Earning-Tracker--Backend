import { Server } from "socket.io";

let io;
const onlineUsers = new Map();

export const initSocket = (server) => {
    io = new Server(server, { cors: { origin: "*" } });

    io.on("connection", (socket) => {
        const { userId } = socket.handshake.query;
        if (userId) onlineUsers.set(userId, socket.id);
        socket.join(userId);

        socket.on("disconnect", () => {
            onlineUsers.delete(userId);
        });
    });
};

export const sendRealtimeNotification = (userId, payload) => {
    const socketId = onlineUsers.get(userId);
    if (socketId) io.to(socketId).emit("notification", payload);
};

export const getIoInstance = () => io;
