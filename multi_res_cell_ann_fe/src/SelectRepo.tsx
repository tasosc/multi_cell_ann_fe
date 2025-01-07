import '@mantine/core/styles.css';
import { Switch } from '@mantine/core';

import {Stage} from './Stage';
import { useEffect, useState } from 'react';
import { BackendApi } from './api';
interface SelectedRepoProps {
    selectedRepo: string[];
    onChange: (selected: string[], new_stage: Stage) => void;
    tissue: string;
}

interface SourceRadioProps {
    repo: string;
}

function RepoSwitch(props: SourceRadioProps) {
    return (
        <Switch key={props.repo} value={props.repo} label={props.repo}/>
    );
}

export function SelectedRepo(props: SelectedRepoProps) {
    if (!props.tissue) {
        return (<></>);
    }

    let api = new BackendApi();
    const [repos, setRepos] = useState<string[]>([]);
    useEffect(() => {api.get_sources(props.tissue, setRepos)} ,[props.tissue]);
    const [value, setValue] = useState(props.selectedRepo);
    const repo_switch = []
    
    for(var repo of repos) {
        repo_switch.push(<RepoSwitch repo={repo}   />);
    }
    let onChange = (selected: string[]) => {
        setValue(selected);
        props.onChange(selected, Stage.Cell)
    };

    return (
    <Switch.Group value={value} onChange={onChange}>
        {repo_switch}
    </Switch.Group>
    );
}