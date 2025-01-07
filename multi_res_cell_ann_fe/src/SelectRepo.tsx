import '@mantine/core/styles.css';
import { ActionIcon, Stack, Switch } from '@mantine/core';

import {Stage} from './Stage';
import { useEffect, useState } from 'react';
import { BackendApi } from './api';
import { IconArrowNarrowRight } from '@tabler/icons-react';
interface SelectedRepoProps {
    selectedRepo: string[];
    onChange: (selected: string[]) => void;
    tissue: string;
}

function get_key(value: string) {
    return `key${value.replace(/[ .]/g, "_").toLowerCase()}`;
}


export function SelectedRepo(props: SelectedRepoProps) {
    if (!props.tissue) {
        return (<></>);
    }

    const api = new BackendApi();
    const [repos, setRepos] = useState<string[]>([]);
    useEffect(() => {api.get_sources(props.tissue, setRepos)} ,[props.tissue]);
    const [value, setValue] = useState(props.selectedRepo);
    const repo_switch = []
    
    for(var repo of repos) {
        repo_switch.push(<Switch key={get_key(repo)} value={repo} label={repo} />);
    }

    return (
        <Switch.Group key="repo_select" value={value} onChange={(value) => {
            setValue(value);
            props.onChange(value);
        }}>
            {repo_switch}
        </Switch.Group>
    );
}