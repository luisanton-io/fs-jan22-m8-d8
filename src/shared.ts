interface Shared {
    onlineUsers: OnlineUser[]
}

interface OnlineUser {
    username: string;
    socketId: string;
    room: string;
}

// let onlineUsers: OnlineUser[] = [];

const shared: Shared = {
    // in-memory stuff that we are using on different places in our server.
    onlineUsers: []
}

export default shared



