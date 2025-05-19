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
}

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

export function TeamsProvider({ children }: { children: ReactNode }) {
    const { isLoggedIn } = useAuth();
    const [myRegularTeams, setMyRegularTeams] = useState<Team[]>([]);
    const [myOneTimeTeams, setMyOneTimeTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTeams = async () => {
        if (!isLoggedIn) {
            setMyRegularTeams([]);
            setMyOneTimeTeams([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const [regularResponse, oneTimeResponse] = await Promise.all([
                teamApi.getMyRegularTeams(),
                teamApi.getMyOneTimeTeams(),
            ]);
            setMyRegularTeams(regularResponse.data);
            setMyOneTimeTeams(oneTimeResponse.data);
        } catch (error) {
            console.error("Error fetching teams:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, [isLoggedIn]);

    const getTeamById = (teamId: string): Team | undefined => {
        return [...myRegularTeams, ...myOneTimeTeams].find(team => team.id === teamId);
    };

    return (
        <TeamsContext.Provider
            value={{
                myRegularTeams,
                myOneTimeTeams,
                isLoading,
                refreshTeams: fetchTeams,
                getTeamById,
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