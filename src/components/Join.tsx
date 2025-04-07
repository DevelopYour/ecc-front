import { useState } from "react";
import { createUser } from "../api/user";
import { IUserCreate } from "../types/user";

export default function Join() {
    const [formData, setFormData] = useState<IUserCreate>({
        studentId: "",
        password: "",
        tel: "",
        kakaoTel: "",
        name: "",
        email: "",
        level: 0,
        majorId: 0,
    });

    const [motivation, setMotivation] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.name.trim()) newErrors.name = "이름은 필수입니다.";
        if (!/^\d{8}$/.test(formData.studentId)) newErrors.studentId = "8자리 숫자여야 합니다.";
        if (!formData.majorId) newErrors.majorId = "전공 ID는 필수입니다.";
        if (!/^01(?:0|1|[6-9])(?:\d{3}|\d{4})\d{4}$/.test(formData.tel)) newErrors.tel = "전화번호 형식이 올바르지 않습니다.";
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "이메일 형식이 올바르지 않습니다.";
        if (![1, 2, 3].includes(Number(formData.level))) newErrors.level = "1~3 사이의 숫자를 입력하세요.";
        if (!motivation.trim()) newErrors.motivation = "지원 동기를 입력해주세요.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === "level" || name === "majorId" ? Number(value) : value });
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            const payload: IUserCreate = {
                ...formData,
                level: Number(formData.level),
                majorId: Number(formData.majorId),
            };

            const user = await createUser(payload);
            console.log("✅ 가입 성공:", user);
        } catch (error) {
            console.error("❌ 가입 요청 실패:", error);
        }
    };

    const renderField = (
        id: string,
        label: string,
        value: string | number,
        type: string = "text",
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    ) => (
        <div className="mb-10 flex items-center">
            <label htmlFor={id} className="w-32 text-c-gray mr-4">
                {label}
            </label>
            <input
                type={type}
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                className={`flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 ${errors[id] ? "border-red-500" : "border-gray-300"
                    } focus:ring-c-green`}
            />
            {errors[id] && (
                <p className="ml-4 text-sm text-red-500 whitespace-nowrap">{errors[id]}</p>
            )}
        </div>
    );

    return (
        <div className="flex items-center justify-center">
            <div className="p-8 rounded shadow-md w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-6 text-center">회원가입</h2>

                {renderField("name", "이름", formData.name, "text", handleChange)}
                {renderField("studentId", "학번", formData.studentId, "text", handleChange)}
                {renderField("tel", "전화번호", formData.tel, "tel", handleChange)}
                {renderField("kakaoTel", "카카오톡 아이디", formData.kakaoTel, "tel", handleChange)}
                {renderField("email", "이메일", formData.email, "email", handleChange)}

                <div className="mb-10">
                    <label className="block mb-2 text-c-gray">영어 실력</label>
                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, level: 1 })}
                            className={`text-left px-4 py-2 rounded border ${formData.level === 1 ? "bg-c-greenLight text-white border-c-green" : "border-gray-300"
                                }`}
                        >
                            <strong>Beginner</strong> - 기본적인 자기소개 및 간단한 문장 구사
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, level: 2 })}
                            className={`text-left px-4 py-2 rounded border ${formData.level === 2 ? "bg-c-greenLight text-white border-c-green" : "border-gray-300"
                                }`}
                        >
                            <strong>Intermediate</strong> - 일상 대화 및 의견 표현 가능, 여행 시 의사소통 원활
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, level: 3 })}
                            className={`text-left px-4 py-2 rounded border ${formData.level === 3 ? "bg-c-greenLight text-white border-c-green" : "border-gray-300"
                                }`}
                        >
                            <strong>Advanced</strong> - 비즈니스 및 학술적인 대화 가능, 유창한 의사소통
                        </button>
                    </div>
                    {errors.level && (
                        <p className="mt-2 text-sm text-red-500">{errors.level}</p>
                    )}
                </div>

                {renderField("majorId", "전공 ID", formData.majorId, "number", handleChange)}

                {/* 지원 동기만 별도 상태 */}
                <div className="mb-6 flex items-center">
                    <label htmlFor="motivation" className="w-32 text-c-gray mr-4">
                        지원 동기
                    </label>
                    <input
                        type="text"
                        id="motivation"
                        name="motivation"
                        value={motivation}
                        onChange={(e) => setMotivation(e.target.value)}
                        className={`flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 ${errors.motivation ? "border-red-500" : "border-gray-300"
                            } focus:ring-c-green`}
                    />
                    {errors.motivation && (
                        <p className="ml-4 text-sm text-red-500 whitespace-nowrap">{errors.motivation}</p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full bg-c-greenLight text-white py-2 rounded hover:bg-c-green transition"
                >
                    가입 신청
                </button>
            </div>
        </div>
    );
}