
export interface IUser{
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
