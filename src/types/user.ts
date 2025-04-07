export interface IUser {
    uuid: number;
    studentId: string;
    password: string;
    tel: string;
    kakaoTel: string;
    name: string;
    email: string;
    level: number;
    rate: number;
    status: string;
    majorId: number;
    majorName: string;
    role: string;
}

export interface IUserCreate {
    studentId: string;
    password: string;
    tel: string;
    kakaoTel: string;
    name: string;
    email: string;
    level: number;
    majorId: number;
}