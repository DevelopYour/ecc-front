// 'use client';

// import React from 'react';
// import { useRouter } from 'next/navigation';

// export default function RegularApplyPage() {
//     const router = useRouter();

//     const handleApplyClick = () => {
//         router.push('/regular/apply/form');
//     };

//     return (
//         <div className="container mx-auto p-6 max-w-4xl">
//             <div className="text-center">
//                 <h1 className="text-3xl font-bold mb-8">정규 스터디</h1>

//                 <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-8">
//                     <div className="mb-6">
//                         <span className="inline-block bg-green-500 text-white px-4 py-2 rounded-full text-lg font-semibold">
//                             모집중
//                         </span>
//                     </div>

//                     <h2 className="text-xl font-semibold mb-4 text-gray-800">
//                         정규 스터디 신청이 가능합니다
//                     </h2>

//                     <p className="text-gray-600 mb-6">
//                         원하는 과목과 시간을 선택하여 정규 스터디에 참여하세요.
//                     </p>

//                     <button
//                         onClick={handleApplyClick}
//                         className="px-8 py-3 bg-mygreen text-white rounded-lg hover:bg-green-600 text-lg font-semibold transition-colors"
//                     >
//                         신청하기
//                     </button>
//                 </div>

//                 <div className="text-left bg-gray-50 rounded-lg p-6">
//                     <h3 className="text-lg font-semibold mb-4">신청 안내</h3>
//                     <ul className="space-y-2 text-sm text-gray-700">
//                         <li>• 원하는 과목을 선택할 수 있습니다</li>
//                         <li>• 각 요일별로 최소 2시간 이상 연속으로 선택해야 합니다</li>
//                         <li>• 신청 후 수정 및 취소가 가능합니다</li>
//                     </ul>
//                 </div>
//             </div>
//         </div>
//     );
// }

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function RegularApplyPage() {
    const router = useRouter();

    const handleApplyClick = () => {
        router.push('/regular/apply/form');
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-8">정규 스터디</h1>

                <div className="bg-red-50 border border-red-200 rounded-lg p-8 mb-8">
                    <div className="mb-6">
                        <span className="inline-block bg-red-500 text-white px-4 py-2 rounded-full text-lg font-semibold">
                            모집 마감
                        </span>
                    </div>

                    <h2 className="text-xl font-semibold mb-4 text-gray-800">
                        정규 스터디 모집이 마감되었습니다
                    </h2>

                    <p className="text-gray-600 mb-6">
                        다음 모집 기간을 기다려주세요.
                    </p>

                    <button
                        disabled
                        className="px-8 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed text-lg font-semibold"
                    >
                        신청 마감
                    </button>
                </div>

                <div className="text-left bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">신청 안내</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li>• 원하는 과목을 선택할 수 있습니다</li>
                        <li>• 각 요일별로 최소 2시간 이상 연속으로 선택해야 합니다</li>
                        <li>• 신청 후 수정 및 취소가 가능합니다</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}