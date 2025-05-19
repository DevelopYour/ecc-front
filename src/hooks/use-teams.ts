import { useTeams as useTeamsContext } from "@/context/teams-context";

export function useTeams() {
    const teams = useTeamsContext();

    return {
        ...teams,
        hasRegularTeam: teams.myRegularTeams.length > 0,
        regularTeamCount: teams.myRegularTeams.length,
        oneTimeTeamCount: teams.myOneTimeTeams.length,
    };
}