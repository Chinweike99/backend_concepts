import { User } from "../types";


class UserService {
    private users: Map<string, User> = new Map();

    addUser(socketId: string, username: string, room?: string): User {
        const user: User = {id: socketId, username, room};
        this.users.set(socketId, user);
        return user;
        };

        getUser(socketId: string): User | undefined {
            return this.users.get(socketId)
        }

        removeUser(socketId: string): boolean {
            return this.users.delete(socketId)
        }

        getUsersInRoom(room: string): User[] {
            return Array.from(this.users.values()).filter(user => user.room === room)
        }

}

export const userService = new  UserService();


