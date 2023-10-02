import { chatListeners } from '../listeners/chatsListeners.js';
import { messageListeners } from '../listeners/messageListeners.js';

export class Socket {
    constructor(io) {
        this.io = io;
        this.connectedUsers = [];
    }

    socketEvents() {
        this.io.on('connection', (socket) => {
            console.log('a user connected with id: ', socket.id);

            socket.on('inituser', (userObject) => {
                this.connectedUsers.push({
                    socket,
                    user_id: userObject.user_id,
                });
                userObject.chats.forEach((el) => {
                    socket.join(el);
                });
                console.log(this.io.sockets.adapter.rooms);
            });

            socket.on('disconnect', () => {
                this.connectedUsers = this.connectedUsers.filter((x) => x.socket.id !== socket.id);
            });

            socket.on('chat message', messageListeners.newMessage(socket));

            socket.on('new chat', chatListeners.newChat(socket, this.io, this.connectedUsers));
        });
    }
}
