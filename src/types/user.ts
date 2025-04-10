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

export interface IMajor {
    id: number;
    name: string;
    college: College;
}

export enum College {
    ENGINEERING = "ENGINEERING",
    ICT = "ICT",
    ENERGY_BIO = "ENERGY_BIO",
    DESIGN = "DESIGN",
    HUMANITIES = "HUMANITIES",
    BUSINESS = "BUSINESS",
    FUTURE_CONVERGENCE = "FUTURE_CONVERGENCE",
    CREATIVE_CONVERGENCE = "CREATIVE_CONVERGENCE",
    ST_FREE_MAJOR = "ST_FREE_MAJOR"
}

export const COLLEGE_LABELS: { [key in College]: string } = {
    [College.ENGINEERING]: "공과",
    [College.ICT]: "정보통신",
    [College.ENERGY_BIO]: "에너지바이오",
    [College.DESIGN]: "조형",
    [College.HUMANITIES]: "인문사회",
    [College.BUSINESS]: "기술경영",
    [College.FUTURE_CONVERGENCE]: "미래융합",
    [College.CREATIVE_CONVERGENCE]: "창의융합",
    [College.ST_FREE_MAJOR]: "자유전공",
};
