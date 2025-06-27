'use client'
import React from 'react';

export default function AdminPage() {
    const stats = [
        {
            title: '전체 회원 수',
            value: '0',
            icon: (
                <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
                </svg>
            ),
            linkText: '회원 관리',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600'
        },
        {
            title: '관리 필요 인원',
            value: '0',
            icon: (
                <svg className="w-8 h-8 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            ),
            linkText: '회원 상세 보기',
            bgColor: 'bg-pink-50',
            textColor: 'text-pink-600'
        },
        {
            title: '전체 스터디 수',
            value: '0',
            icon: (
                <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd"></path>
                </svg>
            ),
            linkText: '스터디 관리',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            title: '관리 필요 스터디',
            value: '0',
            icon: (
                <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                </svg>
            ),
            linkText: '스터디 상세 보기',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600'
        }
    ];

    return (
        <div className="space-y-6">
            {/* 페이지 제목 */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">관리자 대시보드</h2>
                <p className="text-gray-600">ECC 동아리 현황을 한눈에 확인하세요</p>
            </div>

            {/* 통계 카드들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                {stat.icon}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                            <button className={`text-sm font-medium ${stat.textColor} hover:underline flex items-center space-x-1`}>
                                <span>{stat.linkText}</span>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 하단 섹션들 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 동아리 공지사항 작성 및 조회 */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">동아리 공지사항 작성 및 조회</h3>
                    <div className="flex items-center justify-center h-32 text-gray-400">
                        <div className="text-center">
                            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd"></path>
                            </svg>
                            <p className="text-sm">등록된 공지사항이 없습니다.</p>
                        </div>
                    </div>
                </div>

                {/* 시스템 일일 및 차터에어 할 작업 */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">시스템 일일 및 차터에어 할 작업</h3>
                    <div className="space-y-3">
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                                </svg>
                                <p className="text-sm text-yellow-800">승인 대기 가입신청이 있습니다.</p>
                            </div>
                            <p className="text-xs text-yellow-700 mt-1">가능한 빨리 검토해주세요.</p>
                        </div>

                        <div className="bg-pink-50 border-l-4 border-pink-400 p-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-pink-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                                </svg>
                                <p className="text-sm text-pink-800">영어 레벨 변경 신청이 있습니다.</p>
                            </div>
                            <p className="text-xs text-pink-700 mt-1">가능한 빨리 검토해주세요.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}