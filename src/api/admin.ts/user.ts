import axios from 'axios';
import { IUser } from '../../types/user';

export const fetchUser = async (studentId: string): Promise<IUser> => {
    const { data } = await axios.get<IUser>(`/api/admin/users/${studentId}`);
    return data;
};

export const fetchAllUsers = async (): Promise<IUser[]> => {
    const { data } = await axios.get<IUser[]>('/api/admin/users');
    return data;
};
