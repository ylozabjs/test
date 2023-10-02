import { getDb } from '../db/connection.js';
import { createMessage } from '../models/messageModel.js';

export const messageListeners = {
    newMessage: (socket) => async (messageObject, callback) => {
        const db = getDb();
        const messagesCollection = db.collection('messages');
        const {
            user_id,
            chat_id,
            message,
        } = messageObject;

        const currentDate = new Date().toLocaleString().replace(',', '');

        const newMessage = createMessage(user_id, chat_id, message, currentDate);
        try {
            await messagesCollection.insertOne(newMessage);
            const messageId = newMessage._id.toString();
            console.log(chat_id);
            socket.broadcast.to(chat_id).emit('new message', newMessage);
            callback({
                id: messageId,
                date: currentDate,
            });
        } catch (err) {
            socket.emit('error', err);
            console.log(err);
            callback({
                error: 'Error creating message',
            });
        }
    },
};
