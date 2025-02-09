import { useEffect, useRef, useState } from "react";
import { Activity, BackendApi, Cell, Settings } from "./api";
import { Loader } from "@mantine/core";
import { StartDatasetProcess } from "./UploadDataset";

interface AnalysisProps {
    settings: Settings;
    cells: Cell[];
    onSessionChange: (session_id: string) => void;
    dataset?: File|null;
}

interface SessionResp {
    session: string;
}

export function Analysis(props: Readonly<AnalysisProps>) {
    const api = new BackendApi();
    const [session, setSession] = useState("");
    const [when, setWhen] = useState<Date>(new Date());
    const initialized = useRef(false)
    useEffect(() => {
        async function create_session() {
            const response : SessionResp= await api.create_session(props.settings, props.cells);
            setSession(response.session);
            setWhen(new Date())
        }

        if (!initialized.current) {
            initialized.current = true;
            create_session();
        }

    }, [props.settings, props.cells]);

    return (
        <>
        {!session && <Loader color="blue" />}
        {session && <StartDatasetProcess session_id={session} start={{activity: Activity.NONE, finished: when, duration:-1}} dataset={props.dataset} />}
        </>
    );
}