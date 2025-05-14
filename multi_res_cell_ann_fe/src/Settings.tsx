import { useEffect, useState } from "react";
import { api_instance, default_settings, Settings, SvdSolverOptions } from "./api";
import { NumberInput, Select, Slider, TextInput, Text, Title, Switch, Button, Space } from "@mantine/core";
import { IconFileImport } from "@tabler/icons-react";

interface SettingsProps {
    settings?: Settings;
    onSave: (settings: Settings) => void;
}

interface PureNumberInputProps {
    onChange: (value: number) => void;
    value: number;
    label: string;
    min?: number;
    max?: number;
}

function PureNumberInput (props: Readonly<PureNumberInputProps>) {
    return (
            <NumberInput label={props.label} min={props.min} max={props.max} value={props.value} onChange={(value) => props.onChange(+value)}/>);
}


export function SettingsOptions(props: Readonly<SettingsProps>) {

    const [defaultSettings, setDefaultSettings] = useState<Settings>(props.settings ?? default_settings());

    useEffect(() => {
        if (props.settings === undefined) {
            api_instance.get_default_settings().then((settings) => setDefaultSettings(settings));
        }
    },[props.settings]);

    return (
            <>
            <Title order={3}>General settings</Title>
            <Text>Verbosity</Text>
            <Slider color="blue" marks={[
                {value: 0, label: "0"},
                {value: 1, label: "1"},
                {value: 2, label: "2"},
                {value: 3, label: "3"}
            ]} step={1} min={0} max={3} value={defaultSettings.verbosity} onChange={(value => setDefaultSettings({...defaultSettings, verbosity: value}))}/>
            <Space h="md"/>
            <Title order={3}>Reading dataset settings</Title>
            <TextInput label="Reading CSV, field delimiter" maxLength={1} value={defaultSettings.csv_delimiter} onChange={event => setDefaultSettings({...defaultSettings, csv_delimiter: event.currentTarget.value})}/>
            <Space h="md"/>
            <Title order={3}>Quality Control settings</Title>
            <PureNumberInput label="Lower cut-off of gene number for filtering cells" value={defaultSettings.n_genes_min} onChange={(value) => setDefaultSettings({...defaultSettings, n_genes_min: value})}/>
            <PureNumberInput label="Upper cut-off of gene number for filtering cells" value={defaultSettings.n_genes_max} onChange={(value) => setDefaultSettings({...defaultSettings, n_genes_max: value})}/>
            <PureNumberInput label="Minimum genes that should be expressed in each cell" value={defaultSettings.min_genes} onChange={(value) => setDefaultSettings({...defaultSettings, min_genes: value})}/>
            <PureNumberInput label="Minimum number of cells expected to express each gene" value={defaultSettings.min_cells} onChange={(value) => setDefaultSettings({...defaultSettings, min_cells: value})}/>
            <PureNumberInput label="Upper cut-off of counts for filtering cells" value={defaultSettings.n_counts_max} onChange={(value) => setDefaultSettings({...defaultSettings, n_counts_max: value})}/>
            <PureNumberInput label="Upper cut-off of counts for filtering cells" value={defaultSettings.n_counts_max} onChange={(value) => setDefaultSettings({...defaultSettings, n_counts_max: value})}/>
            <Space h="sm"/>
            <Text size="sm">Percentage of mitochondrial gene expression (cut-off)</Text>
            <Slider color="blue" marks={[
                {value: 0, label: "0"},
                {value: 25, label: "25"},
                {value: 50, label: "50"},
                {value: 75, label: "75"},
                {value: 100, label: "100"}
            ]} step={1} min={0} max={100} value={defaultSettings.pc_mito} onChange={(value => setDefaultSettings({...defaultSettings, pc_mito: value}))}/>
            <Space h="sm"/>
            <Text size="sm">Percentage of ribosomal gene expression (cut-off)</Text>
            <Slider color="blue" marks={[
                {value: 0, label: "0"},
                {value: 25, label: "25"},
                {value: 50, label: "50"},
                {value: 75, label: "75"},
                {value: 100, label: "100"}
            ]} step={1} min={0} max={100} value={defaultSettings.pc_rib} onChange={(value => setDefaultSettings({...defaultSettings, pc_rib: value}))}/>
            <Space h="md"/>
            <Title order={3}>Normalization settings</Title>
            <Switch label="Normalize total counts" checked={defaultSettings.normalize_total_counts} onChange={(event) => setDefaultSettings({...defaultSettings, normalize_total_counts: event.currentTarget.checked})}/>
            <Space h="md"/>
            <Title order={3}>Feature Selection settings</Title>
            <Switch label="Only highy variable genes" checked={defaultSettings.only_highly_significant_genes} onChange={(event) => setDefaultSettings({...defaultSettings, only_highly_significant_genes: event.currentTarget.checked})}/>
            <Space h="md"/>
            <Title order={3}>Dimensionality reduction settings</Title>
            <Select label="SVD Solver" defaultValue={defaultSettings.svd_solver} data={Object.values(SvdSolverOptions).filter(value => typeof value == 'string')}
                    onChange={(value: string|null) => value && setDefaultSettings({...defaultSettings, svd_solver: SvdSolverOptions[value as keyof typeof SvdSolverOptions]})} />
            <Space h="md"/>
            <Title order={3}>Visualization settings</Title>
            <PureNumberInput label="Number of Neighbours" min={2} max={100} value={defaultSettings.n_neigh} onChange={(value) => setDefaultSettings({...defaultSettings, n_neigh: value})}/>
            <PureNumberInput label="Number of principal components (PCs)" min={0} value={defaultSettings.n_pcs} onChange={(value) => setDefaultSettings({...defaultSettings, n_pcs: value})}/>
            <Text size="sm">Cluster resolution</Text>
            <Slider color="blue" marks={[
                {value: 0, label: "0"},
                {value: 0.25, label: ".25"},
                {value: 0.50, label: ".50"},
                {value: 0.75, label: ".75"},
                {value: 1.00, label: "1.0"}
            ]} step={0.1} min={0.1} max={1.0} value={defaultSettings.cluster_resolution} onChange={(value => setDefaultSettings({...defaultSettings, cluster_resolution: value}))}/>
            <Space h="md"/>
            <Button variant="filled" onClick={() => props.onSave(defaultSettings)}><IconFileImport/>Save</Button>
</>

    );
}
