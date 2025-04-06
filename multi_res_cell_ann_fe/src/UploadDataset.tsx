import { useEffect, useRef, useState } from "react";
import { Activity, api_instance, BackendApi, FeedbackModel } from "./api";
import { Feedback } from "./Feedback";
import { useMap } from "@mantine/hooks";

interface UploadDatasetProps {
    dataset?: File|null;
    session_id: string;
    start : FeedbackModel
}

export function StartDatasetProcess(props: Readonly<UploadDatasetProps>) {
    const initialized = useRef(false)
    const api = api_instance;
    const activityLog = useMap<Activity, FeedbackModel>([[Activity.NONE, props.start]]);
    const [active, setActive] = useState(0);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;

            api
                .analyze(props.session_id, props.dataset)
                .then(resp => resp.json())
                .then((r: FeedbackModel) => activityLog.set(Activity.UPLOAD_DATASET, r))
                .then(() => setActive(1))
        }
    }, [])

    return (
        <>
        { active > 0 && <Feedback analysisSocket={api.get_analysis_socket(props.session_id)} activityLog={activityLog} />}
        </>
    );
}
