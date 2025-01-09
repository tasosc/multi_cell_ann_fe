import { useEffect, useState } from "react";
import { BackendApi, Cell, CellImpl } from "./api";
import { Accordion, ActionIcon, Badge, Container, Drawer, Grid, MultiSelect, NavLink, Stack, Switch, TextInput } from "@mantine/core";
import { IconChevronRight, IconPlus, IconSearch } from "@tabler/icons-react";
import { get_key } from "./utils";
import { useDisclosure, useMap } from "@mantine/hooks";

interface CellsSelectionProps {
    tissue: string;
    repos: string[];
    onCellsSelected: (cells: Cell[]) => void;
}

export function CellsSelection(props: CellsSelectionProps) {
    const api = new BackendApi();
    const [cells, setCells] = useState<Cell[]>([]);
    const [search, setSearch] = useState("");
    const [currentCell, setCurrentCell] = useState("");

    const selectedMap = useMap<string, Cell>([]);


    useEffect(() => {
        api
        .get_cells(props.tissue, props.repos)
        .then((rcells) => setCells(rcells));
    }, [props.repos, props.tissue]);

    const fullMap = new Map(cells.map(cell => [cell.cell_type, cell]));
    const [opened, { open, close }] = useDisclosure(false);
    const filteredCells = search && search.length > 0? cells.filter((item) => item.cell_type.toLowerCase().includes(search.toLowerCase().trim()) ) : cells;
    // TODO current cell could be Cell ? and have only one map with 
    const options = filteredCells.map((item) => {
        return (<NavLink 
                key={get_key(item.cell_type)}
                href="#required-for-focus"
                label={item.cell_type}
                active={currentCell === item.cell_type}
                onClick={() => {
                    open();
                    return setCurrentCell(item.cell_type);
                }}
                description={`Total genes ${item.genes.length}`}
                leftSection={
                    <Badge size="xs" color="green" circle>
                        {selectedMap.get(item.cell_type)?.gene_selection?.length ?? 0}
                    </Badge>
                }
                rightSection={<IconChevronRight />}
                />);
    });

    return (
        <Container style={{width: '500px'}}>
            <Stack>
                <Grid>
                    <Grid.Col span={8}><TextInput value={search} label="Search for or add a cell" placeholder="Type a name of a cell type" onChange={(event) => setSearch(event.currentTarget.value)} /></Grid.Col>
                    <Grid.Col span={2}><ActionIcon disabled={!search} variant="filled" aria-label="Add Cell" size="input-sm"><IconPlus /> </ActionIcon></Grid.Col>
                </Grid>
                {options}
            </Stack>
            <Drawer position="right" opened={opened} onClose={close} title={`Select Genes for cell ${currentCell}`}>
                <Stack>
                    <Switch checked={selectedMap.get(currentCell)?.is_selected ?? false} onChange={(event) => {
                        // TODO maybe combine both maps full and selected
                        const c : Cell = (selectedMap.get(currentCell) ?? fullMap.get(currentCell)) as Cell;
                        // const c : Cell = selectedMap.get(currentCell) ?? fullMap.get(currentCell) ?? new CellImpl(currentCell, []);
                        c.is_selected = event.currentTarget.checked;
                        selectedMap.set(currentCell, c)
                    }}/>
                    <MultiSelect data={fullMap.get(currentCell)?.genes }/>
                </Stack>
            </Drawer>
        </Container>
    );
}