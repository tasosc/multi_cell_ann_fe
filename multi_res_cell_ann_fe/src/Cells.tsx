import { useEffect, useState } from "react";
import { BackendApi, Cell } from "./api";
import { Accordion, ActionIcon, Container, Grid, MultiSelect, Stack, TextInput } from "@mantine/core";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { get_key } from "./utils";

interface CellsSelectionProps {
    tissue: string;
    repos: string[];
    onCellsSelected: (cells: Cell[]) => void;
}

export function CellsSelection(props: CellsSelectionProps) {
    const api = new BackendApi();
    const [cells, setCells] = useState<Cell[]>([]);
    const [search, setSearch] = useState("");
    const [selectedCells, setSelectedCells] = useState<Cell[]>([]);




    useEffect(() => {
        api
        .get_cells(props.tissue, props.repos)
        .then((rcells) => setCells(rcells));
    }, [props.repos, props.tissue]);

    const filteredCells = search && search.length > 0? cells.filter((item) => item.cell_type.toLowerCase().includes(search.toLowerCase().trim()) ) : cells;

    const options = filteredCells.map((item) => {
        return (<Accordion.Item key={get_key(item.cell_type)} value={item.cell_type}>
            <Accordion.Control>{item.cell_type}</Accordion.Control>
            <Accordion.Panel>
                <MultiSelect key={get_key(item.cell_type)} placeholder="Select a gene" data={item.genes} value={item.gene_selection ?? []} searchable />
            </Accordion.Panel>
        </Accordion.Item>);
    });

    return (
        <Container style={{width: '500px'}}>
            <Stack>
                <Grid>
                    <Grid.Col span={8}><TextInput value={search} label="Search for or add a cell" placeholder="Type a name of a cell type" onChange={(event) => setSearch(event.currentTarget.value)} /></Grid.Col>
                    <Grid.Col span={2}><ActionIcon disabled={!search} variant="filled" aria-label="Add Cell" size="input-sm"><IconPlus /> </ActionIcon></Grid.Col>
                </Grid>
                <Accordion>
                    {!options ? <Accordion.Item value="loading"></Accordion.Item> : options}
                </Accordion>
            </Stack>
        </Container>
    );
}