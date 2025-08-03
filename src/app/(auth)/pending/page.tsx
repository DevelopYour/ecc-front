// app/(auth)/pending/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function PendingPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    if (!user) {
        return null; // 로딩 중이거나 리다이렉트 중
    }

    return (
        <div className="space-y-6">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                        <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        가입 승인 대기중입니다!
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        관리자의 승인을 기다리고 있습니다.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-2">
                            안녕하세요, <span className="font-semibold">{user.name}</span>님
                        </p>
                        <p className="text-sm text-gray-600">
                            계정이 생성되었지만 아직 관리자의 승인이 필요합니다.
                            승인이 완료되면 모든 기능을 이용하실 수 있습니다.
                        </p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">문의사항이 있으시다면</h4>
                        <div className="space-y-2 text-sm text-blue-700">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span>이메일: admin@example.com</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>회장 조유진: 010-8856-5243</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}