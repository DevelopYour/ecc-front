// context/teams-context.tsx
"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { Team } from "@/types/team";
import { teamApi } from "@/lib/api";
import { useAuth } from "./auth-context";

interface TeamsContextType {
    myRegularTeams: Team[];
    myOneTimeTeams: Team[];
    isLoading: boolean;
    refreshTeams: () => Promise<void>;
    getTeamById: (teamId: string) => Team | undefined;
    hasRegularTeam: boolean;
    regularTeamCount: number;
    oneTimeTeamCount: number;
}

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

export function TeamsProvider({ children }: { children: ReactNode }) {
    const { isLoggedIn, user } = useAuth();
    const [myRegularTeams, setMyRegularTeams] = useState<Team[]>([]);
    const [myOneTimeTeams, setMyOneTimeTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    // 팀 정보 로드 함수
    const loadTeams = async () => {
        if (!isLoggedIn) {
            setMyRegularTeams([]);
            setMyOneTimeTeams([]);
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
        } catch (error) {
            console.error("Error loading teams:", error);
            setMyRegularTeams([]);
            setMyOneTimeTeams([]);
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

    // 편의 속성들
    const hasRegularTeam = myRegularTeams.length > 0;
    const regularTeamCount = myRegularTeams.length;
    const oneTimeTeamCount = myOneTimeTeams.length;

    return (
        <TeamsContext.Provider
            value={{
                myRegularTeams,
                myOneTimeTeams,
                isLoading,
                refreshTeams,
                getTeamById,
                hasRegularTeam,
                regularTeamCount,
                oneTimeTeamCount,
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