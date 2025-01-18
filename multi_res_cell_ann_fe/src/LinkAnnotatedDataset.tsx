import { Anchor, Loader } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { BackendApi } from "./api";

interface LinkAnnotatedDatasetProps {
    dataset?: File|null;
    session_id: string;
}

export function LinkAnnotatedDataset(props: LinkAnnotatedDatasetProps) {
    const [annotated, setAnnotated] = useState<Blob|null>(null);
    const initialized = useRef(false)
    const api = new BackendApi();

    const nameWithoutExtension = props.dataset?.name?.replace(/\.gz$/,"")?.replace(/\.[a-zA-Z0-9]+$/,"");
    const downloadName = props.dataset ? `${nameWithoutExtension}_annotated.h5ad` : `output_anotated.h5ad`;
    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            api.analyze(props.session_id, props.dataset)
            .then((resp) => resp.blob())
            .then((blob) => setAnnotated(blob));
        }
    },[props.session_id]);

    return (
        <>
        {annotated && <Anchor href={URL.createObjectURL(annotated)} download={downloadName} target="_blank">Click to download the annotated dataset</Anchor>}
        {!annotated && <Loader color="blue"/>}
        </>
    );
}
