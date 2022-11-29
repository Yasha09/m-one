import * as bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
  const saltOrRounds = 10;

  return await bcrypt.hash(password, saltOrRounds);
};

export const compare = async (loginDto, user) => {
  return await bcrypt.compare(loginDto, user);
};
