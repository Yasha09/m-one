import { User } from '@prisma/client';

export type UserDto = Omit<User, 'password' | 'hash' | 'refreshToken'>;

export const UserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  stetus: true,
  age: true,
  userFriends: true,
  friendUserFriends: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};
