import { useEffect, useState } from "react";
import { BackendApi, Cell, Settings } from "./api";
import { Loader } from "@mantine/core";
import { LinkAnnotatedDataset } from "./LinkAnnotatedDataset";

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
    }, [props.settings, props.cells]);

    return (
        <>
         {!session && <Loader color="blue" />}
         {session && <LinkAnnotatedDataset session_id={session} dataset={props.dataset}/> }
        </>
    );
}