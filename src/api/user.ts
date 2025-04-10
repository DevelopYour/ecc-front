import axios from 'axios';
import { IUserCreate, IUser, IMajor } from '../types/user';

export const createUser = async (userData: IUserCreate): Promise<IUser> => {
    const { data } = await axios.post<IUser>('/api/auth-s/signup', userData);
    return data;
};

export const loginUser = async (studentId: string, password: string): Promise<IUser> => {
    const { data } = await axios.post<IUser>('/api/auth/login', { studentId, password });
    return data;
};

export const fetchAllUsers = async (): Promise<IMajor[]> => {
    const { data } = await axios.get<IMajor[]>('/api/major');
    return data;
};