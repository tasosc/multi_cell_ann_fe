import '@mantine/core/styles.css';
import { Radio, Stack } from '@mantine/core';

import { useState } from 'react';

export enum Sources {
    None,
    Database,
    Import
}

interface SelectedSourceProps {
    currentSource: Sources;
    onChange: (target: Sources) => void;
}

interface SourceRadioProps {
    source: Sources;
    checked: boolean
    onChange: () => void;
}

function SourceRadio(props: Readonly<SourceRadioProps>) {
    return (
        <Radio key={props.source} checked={props.checked} onChange={props.onChange} label={Sources[props.source]}/>
    );
}

export function SelectedSource(props: Readonly<SelectedSourceProps>) {
    const [value, setValue] = useState(props.currentSource);

    return (
        <Stack>
            <SourceRadio checked={value == Sources.Database} source={Sources.Database} onChange={() => {
                setValue(Sources.Database);
                return props.onChange(Sources.Database);
            }}  />
            <SourceRadio  checked={value === Sources.Import} source={Sources.Import} onChange={() => {
                setValue(Sources.Import);
                return props.onChange(Sources.Import);
            }}  />
        </Stack>
    );
}