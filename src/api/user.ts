import axios from 'axios';
import { IUserCreate, IUser } from '../types/user';

export const createUser = async (userData: IUserCreate): Promise<IUser> => {
    const { data } = await axios.post<IUser>('/api/auth-s/signup', userData);
    return data;
};

export const loginUser = async (studentId: string, password: string): Promise<IUser> => {
    const { data } = await axios.post<IUser>('/auth/login', { studentId, password });
    return data;
};