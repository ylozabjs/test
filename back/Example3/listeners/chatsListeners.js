import { ObjectId } from 'mongodb';
import { getDb } from '../db/connection.js';
import { createChatRoom } from '../models/chatRoomModel.js';

export const chatListeners = {
    newChat: (socket, io, connectedUsers) => async (chatObject, callback) => {
        const db = getDb();
        const chatsCollection = db.collection('chatRooms');
        const usersCollection = db.collection('users');
        const {
            chatType,
            user_ids,
        } = chatObject;

        const newChat = createChatRoom(chatType, user_ids);
        try {
            await chatsCollection.insertOne(newChat);
            const chatID = newChat._id.toString();

            await user_ids.forEach(async (user_id) => {
                await usersCollection.updateOne({
                    _id: new ObjectId(user_id),
                }, {
                    $push: { userChats: chatID },
                });
                const userSocket = connectedUsers.find((sockData) => sockData.user_id === user_id);

                if (userSocket != null) {
                    userSocket.socket.join(chatID);
                }
                console.log();
                console.log(io.sockets.adapter.rooms);
                socket.broadcast.to(chatID).emit('chat created', chatObject);
                callback({
                    id: chatID,
                });
            });
        } catch (err) {
            console.log(err);
        }
    },
};
