// context/teams-context.tsx
"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { Team } from "@/types/team";
import { OneTimeTeam } from "@/types/apply-onetime";
import { teamApi, userApi } from "@/lib/api";
import { useAuth } from "./auth-context";

interface TeamsContextType {
    myRegularTeams: Team[];
    myOneTimeTeams: Team[];
    currentUserId: number | null;
    isLoading: boolean;
    refreshTeams: () => Promise<void>;
    getTeamById: (teamId: string) => Team | undefined;
    hasRegularTeam: boolean;
    regularTeamCount: number;
    oneTimeTeamCount: number;
    // 번개 스터디 관련 유틸리티 함수들 추가
    isUserInOneTimeTeam: (team: OneTimeTeam) => boolean;
    getOneTimeTeamParticipationStatus: (team: OneTimeTeam) => string;
}

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

export function TeamsProvider({ children }: { children: ReactNode }) {
    const { isLoggedIn, user } = useAuth();
    const [myRegularTeams, setMyRegularTeams] = useState<Team[]>([]);
    const [myOneTimeTeams, setMyOneTimeTeams] = useState<Team[]>([]);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    // 사용자 정보 로드 함수
    const loadCurrentUser = async () => {
        try {
            const response = await userApi.getMyInfo();
            if (response.success && response.data) {
                setCurrentUserId(response.data.uuid);
            } else {
                setCurrentUserId(null);
            }
        } catch (error) {
            console.error('사용자 정보 로드 실패:', error);
            setCurrentUserId(null);
        }
    };

    // 팀 정보 로드 함수
    const loadTeams = async () => {
        if (!isLoggedIn) {
            setMyRegularTeams([]);
            setMyOneTimeTeams([]);
            setCurrentUserId(null);
            setHasLoaded(false);
            return;
        }

        setIsLoading(true);
        try {
            const [regularResponse, oneTimeResponse] = await Promise.all([
                teamApi.getMyRegularTeams(),
                teamApi.getMyOneTimeTeams(),
            ]);

            setMyRegularTeams(regularResponse.data || []);
            setMyOneTimeTeams(oneTimeResponse.data || []);
            setHasLoaded(true);

            // 사용자 정보도 함께 로드
            await loadCurrentUser();
        } catch (error) {
            console.error("Error loading teams:", error);
            setMyRegularTeams([]);
            setMyOneTimeTeams([]);
            setCurrentUserId(null);
        } finally {
            setIsLoading(false);
        }
    };

    // 로그인 상태 변경 시 팀 정보 로드
    useEffect(() => {
        if (isLoggedIn && !hasLoaded) {
            loadTeams();
        } else if (!isLoggedIn) {
            // 로그아웃 시 상태 초기화
            setMyRegularTeams([]);
            setMyOneTimeTeams([]);
            setCurrentUserId(null);
            setHasLoaded(false);
            setIsLoading(false);
        }
    }, [isLoggedIn, hasLoaded]);

    // 팀 정보 강제 새로고침 (팀 가입/탈퇴 후 호출)
    const refreshTeams = async () => {
        await loadTeams();
    };

    // 팀 ID로 팀 정보 찾기
    const getTeamById = (teamId: string): Team | undefined => {
        return [...myRegularTeams, ...myOneTimeTeams].find(team => team.id === teamId);
    };

    // 현재 사용자가 해당 번개 스터디 팀에 참여했는지 확인하는 함수
    const isUserInOneTimeTeam = (team: OneTimeTeam): boolean => {
        if (!currentUserId || !team.members) return false;
        return team.members.some(member => member.id === currentUserId);
    };

    // 번개 스터디 참여 상태 텍스트 반환
    const getOneTimeTeamParticipationStatus = (team: OneTimeTeam): string => {
        if (team.status !== 'RECRUITING') return '';

        if (isUserInOneTimeTeam(team)) {
            return '참여 신청 완료';
        } else {
            return '참여 가능';
        }
    };

    // 편의 속성들
    const hasRegularTeam = myRegularTeams.length > 0;
    const regularTeamCount = myRegularTeams.length;
    const oneTimeTeamCount = myOneTimeTeams.length;

    return (
        <TeamsContext.Provider
            value={{
                myRegularTeams,
                myOneTimeTeams,
                currentUserId,
                isLoading,
                refreshTeams,
                getTeamById,
                hasRegularTeam,
                regularTeamCount,
                oneTimeTeamCount,
                isUserInOneTimeTeam,
                getOneTimeTeamParticipationStatus,
            }}
        >
            {children}
        </TeamsContext.Provider>
    );
}

export function useTeams() {
    const context = useContext(TeamsContext);
    if (context === undefined) {
        throw new Error("useTeams must be used within a TeamsProvider");
    }
    return context;
}