import { useEffect, useState } from "react";
import { createUser } from "../api/user";
import { College, COLLEGE_LABELS, IMajor, IUserCreate } from "../types/user";
import axios from 'axios';

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

    const [isStudentIdChecked, setIsStudentIdChecked] = useState(false);
    const [motivation, setMotivation] = useState("");
    const [majors, setMajors] = useState<IMajor[]>([]);
    const [selectedCollege, setSelectedCollege] = useState<College | "">("");
    const [collegeDropdownOpen, setCollegeDropdownOpen] = useState(false);
    const [majorDropdownOpen, setMajorDropdownOpen] = useState(false);


    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const fetchMajors = async () => {
            try {
                const { data } = await axios.get<IMajor[]>("/api/major");
                setMajors(data);
            } catch (error) {
                console.error("전공 데이터를 불러오는데 실패했습니다:", error);
            }
        };

        fetchMajors();
    }, []);

    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.name.trim()) newErrors.name = "이름을 입력해주세요.";
        if (!/^\d{8}$/.test(formData.studentId)) newErrors.studentId = "학번은 8자리 숫자여야 합니다.";
        if (!formData.majorId) newErrors.majorId = "전공 ID는 필수입니다.";
        if (!/^01(?:0|1|[6-9])(?:\d{3}|\d{4})\d{4}$/.test(formData.tel)) newErrors.tel = "전화번호 형식이 올바르지 않습니다.";
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "이메일 형식이 올바르지 않습니다.";
        if (![1, 2, 3].includes(Number(formData.level))) newErrors.level = "영어 실력을 선택해주세요.";
        if (!formData.kakaoTel.trim()) newErrors.kakaoTel = "카카오톡 아이디를 입력해주세요.";
        if (!motivation.trim()) newErrors.motivation = "지원 동기를 입력해주세요.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const checkStudentId = async () => {
        if (!formData.studentId.trim()) {
            alert("학번을 입력해주세요.");
            return;
        }

        try {
            const response = await fetch(`/api/auth/signup/check-id?studentId=${formData.studentId}`);
            const result = await response.json();

            if (result.success && result.data === true) {
                alert("사용 가능한 학번입니다.");
                setIsStudentIdChecked(true);
            } else if (result.success && result.data === false) {
                alert("이미 존재하는 학번입니다. 다른 학번을 입력해주세요.");
                setFormData({ ...formData, studentId: "" });
                setIsStudentIdChecked(false);
            } else {
                alert("오류가 발생했습니다: " + result.error);
                setIsStudentIdChecked(false);
            }

        } catch (error) {
            console.error("중복 확인 실패:", error);
            alert("중복 확인 중 오류가 발생했습니다.");
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === "level" || name === "majorId" ? Number(value) : value });
        if (name === "studentId") setIsStudentIdChecked(false);
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        try {
            const user: IUserCreate = {
                ...formData,
                level: Number(formData.level),
                majorId: Number(formData.majorId),
            };
            const response = await createUser(user);
            alert("회원가입이 완료되었습니다.");
        } catch (error) {
            console.error("회원가입 실패:", error);
            alert("회원가입에 실패했습니다. 다시 시도해주세요.");
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

                {/* 이름 */}
                {renderField("name", "이름", formData.name, "text", handleChange)}

                {/* 학번 */}
                <div className="mb-10 flex items-center">
                    <label htmlFor="studentId" className="w-32 text-c-gray mr-4">학번</label>
                    <input
                        type="text"
                        id="studentId"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        className={`flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 ${errors["studentId"] ? "border-red-500" : "border-gray-300"} focus:ring-c-green`}
                        disabled={isStudentIdChecked}
                    />
                    <button
                        type="button"
                        onClick={checkStudentId}
                        disabled={isStudentIdChecked}
                        className={`ml-4 px-3 py-2 rounded text-sm whitespace-nowrap transition ${isStudentIdChecked
                            ? "bg-gray-300 text-white cursor-not-allowed"
                            : "bg-c-greenLight text-white hover:bg-c-green"
                            }`}
                    >
                        {isStudentIdChecked ? "사용가능" : "중복확인"}
                    </button>
                    {errors["studentId"] && (
                        <p className="ml-4 text-sm text-red-500 whitespace-nowrap">{errors["studentId"]}</p>
                    )}
                </div>

                {/* 전화번호 */}
                {renderField("tel", "전화번호", formData.tel, "tel", handleChange)}

                {/* 카카오톡 아이디 */}
                {renderField("kakaoTel", "카카오톡 아이디", formData.kakaoTel, "tel", handleChange)}

                {/* 이메일 */}
                {renderField("email", "이메일", formData.email, "email", handleChange)}

                {/* 영어 실력 */}
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

                {/* 전공 */}
                <div className="mb-10 flex items-center gap-4">
                    {/* 단과대 (College) */}
                    <div className="flex-1 relative">
                        <label className="block mb-2 text-c-gray font-medium">단과대 (College)</label>
                        <button
                            type="button"
                            onClick={() => setCollegeDropdownOpen((prev) => !prev)}
                            className="w-full text-left px-4 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-c-green"
                        >
                            {selectedCollege ? COLLEGE_LABELS[selectedCollege] : "단과대를 선택하세요"}
                        </button>
                        {collegeDropdownOpen && (
                            <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow max-h-60 overflow-auto">
                                {Object.values(College).map((college) => (
                                    <li
                                        key={college}
                                        className="px-4 py-2 hover:bg-c-greenLight cursor-pointer"
                                        onClick={() => {
                                            setSelectedCollege(college);
                                            setFormData({ ...formData, majorId: 0 });
                                            setCollegeDropdownOpen(false);
                                            setMajorDropdownOpen(false);
                                        }}
                                    >
                                        {COLLEGE_LABELS[college]}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* 전공 (Major) */}
                    <div className="flex-1 relative">
                        <label className="block mb-2 text-c-gray font-medium">전공 (Major)</label>
                        <button
                            type="button"
                            onClick={() => selectedCollege && setMajorDropdownOpen((prev) => !prev)}
                            className="w-full text-left px-4 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-c-green disabled:opacity-50"
                            disabled={!selectedCollege}
                        >
                            {formData.majorId
                                ? majors.find((m) => m.id === formData.majorId)?.name
                                : "전공을 선택하세요"}
                        </button>
                        {selectedCollege && majorDropdownOpen && (
                            <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow max-h-60 overflow-auto">
                                {majors
                                    .filter((m) => m.college === selectedCollege)
                                    .map((major) => (
                                        <li
                                            key={major.id}
                                            className="px-4 py-2 hover:bg-c-greenLight cursor-pointer"
                                            onClick={() => {
                                                setFormData({ ...formData, majorId: major.id });
                                                setMajorDropdownOpen(false);
                                            }}
                                        >
                                            {major.name}
                                        </li>
                                    ))}
                            </ul>
                        )}
                        {errors.majorId && (
                            <p className="mt-2 text-sm text-red-500">{errors.majorId}</p>
                        )}
                    </div>
                </div>


                {/* 지원 동기 */}
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