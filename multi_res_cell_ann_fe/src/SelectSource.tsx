import '@mantine/core/styles.css';
import { Radio, Stack } from '@mantine/core';

import {Stage} from './Stage';

interface SelectedSourceProps {
    selectedSource: string;
    onChange: (target: string, new_stage: Stage) => void;
}

const repos : string[] = ["7k", "CellMarker 2.0", "PanglaoDB"]

export function SelectedSource(props: SelectedSourceProps) {
    const repo_radio = []
    for(var repo of repos) {
        repo_radio.push(<Radio key={repo} checked={props.selectedSource === repo} onChange={() => props.onChange(repo, Stage.Tissue)} label={repo}/>);
    }

    return (
        <Stack>
            {repo_radio}
            <Radio key="import" checked={props.selectedSource === "import"} onChange={() => props.onChange("import", Stage.ImportFile)} label="Import from file" />
        </Stack>
    );
}