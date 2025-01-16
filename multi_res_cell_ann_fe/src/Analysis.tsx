import { useEffect, useState } from "react";
import { BackendApi, Cell, Settings } from "./api";
import { Loader, Text } from "@mantine/core";

interface AnalysisProps {
    settings: Settings;
    cells: Cell[];
    onSessionChange: (session_id: string) => void;
    dataset?: File|null;
}

interface SessionResp {
    session: string;
}

export function Analysis(props: AnalysisProps) {
    const api = new BackendApi();
    const [session, setSession] = useState("");
    useEffect(() => {
        api.create_session(props.settings, props.cells)
        .then((resp : SessionResp) => setSession(resp.session))
        //.then(() => api.analyze(session, props.dataset))
        //.then((resp: Blob) => );
        
    }, []);

    return (
        <>
         {!session && <Loader color="blue" />}
         {session && <Text>Session created</Text>}
        </>
    );
}