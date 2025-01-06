import '@mantine/core/styles.css';
import { Radio, Stack } from '@mantine/core';

import {Stage} from './Stage';
import React, { useState } from 'react';

interface SelectedSourceProps {
    selectedSource: string;
    onChange: (target: string, new_stage: Stage) => void;
}

interface SourceRadioProps {
    repo: string;
    checked: boolean
    onChange: (repo: string) => void;
}

const repos : string[] = ["7k", "CellMarker 2.0", "PanglaoDB"]

function SourceRadio(props: SourceRadioProps) {
    return (
        <Radio key={props.repo} checked={props.checked} onChange={()=> props.onChange(props.repo)} label={props.repo}/>
    );
}

export function SelectedSource(props: SelectedSourceProps) {
    const [value, setValue] = useState(props.selectedSource);
    const repo_radio = []
    let onChange = (repo: string) => {
            setValue(repo);
            return props.onChange(repo, Stage.Tissue);
        }
    for(var repo of repos) {
        repo_radio.push(<SourceRadio repo={repo} checked={value === repo} onChange={onChange} />);
    }

    return (
        <Stack>
            {repo_radio}
            <SourceRadio repo='import' checked={value === "import"} onChange={(repo: string) => {
                setValue(repo);
                return props.onChange(repo, Stage.ImportFile);
            }}  />
        </Stack>
    );
}