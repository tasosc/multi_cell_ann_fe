import '@mantine/core/styles.css';
import { Switch } from '@mantine/core';

import { useEffect, useState } from 'react';
import { api_instance } from './api';
import { get_key } from './utils';
interface SelectedRepoProps {
    selectedRepo: string[];
    onChange: (selected: string[]) => void;
    tissue: string;
}

export function SelectedRepo(props: Readonly<SelectedRepoProps>) {
    const [repos, setRepos] = useState<string[]>([]);
    useEffect(() => {api_instance.get_sources(props.tissue, setRepos)} ,[props.tissue]);
    const [value, setValue] = useState(props.selectedRepo);
    const repo_switch = []
     if (!props.tissue) {
        return (<></>);
    }

    for(const repo of repos) {
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