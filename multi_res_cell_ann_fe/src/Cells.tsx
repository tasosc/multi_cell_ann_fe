import { useEffect, useState } from "react";
import { BackendApi, Cell, CellImpl } from "./api";
import { Accordion, ActionIcon, Badge, Container, Drawer, Grid, MultiSelect, NavLink, Stack, Switch, TagsInput, TextInput } from "@mantine/core";
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
    const [search, setSearch] = useState("");
    const [currentCell, setCurrentCell] = useState(new CellImpl("new", []));

    const cells = useMap<string, Cell>([]);


    useEffect(() => {
        api
        .get_cells(props.tissue, props.repos)
        .then((rcells) => rcells.map((entry) => cells.set(entry.cell_type, entry)));
    }, [props.repos, props.tissue]);

    const [opened, { open, close }] = useDisclosure(false);
    const filteredCells = search && search.length > 0? [...cells.values()].filter((item) => item.cell_type.toLowerCase().includes(search.toLowerCase().trim()) ) : [...cells.values()];
    const options = filteredCells.map((item) => {
        return (<NavLink 
                key={get_key(item.cell_type)}
                href="#required-for-focus"
                label={item.cell_type}
                active={currentCell.cell_type === item.cell_type}
                onClick={() => {
                    open();
                    return setCurrentCell(item);
                }}
                description={`Total genes ${item.genes.length}`}
                leftSection={
                    <Badge size="xs" color="green" circle>
                        {cells.get(item.cell_type)?.gene_selection?.length ?? 0}
                    </Badge>
                }
                rightSection={<IconChevronRight />}
                />);
    });

    return (
        <>
            <Stack>
                <TextInput value={search} width="100%" label="Search for or add a cell" placeholder="Type a name of a cell type" 
                onChange={(event) => setSearch(event.currentTarget.value)} rightSection={<IconSearch />} />
                <ActionIcon disabled={!search} variant="filled" aria-label="Add Cell" size="xl"><IconPlus >Add Cell</IconPlus> </ActionIcon>
                {options}
            </Stack>

            <Drawer position="right" offset={8} radius="md" opened={opened} onClose={close} title={`Select Genes for cell ${currentCell.cell_type}`} >
                <Stack>
                    <Switch checked={currentCell.is_selected ?? false} onChange={(event) => {
                        // TODO current cell will be diffent than the one in selectedMap. setCurrentCell maybe ? Then the cells will be different...
                        // maybe we need one source of truth!!!
                        const c = { ...currentCell, is_selected: event.currentTarget.checked };
                        cells.set(currentCell.cell_type, c);
                        setCurrentCell(c);
                    }} />
                    <MultiSelect data={currentCell.genes} value={currentCell.gene_selection ?? []}
                        searchable
                        clearable
                        label="Select one or more genes"
                        nothingFoundMessage="Nothing found..."
                        hidePickedOptions
                        disabled={currentCell.is_selected}
                     onChange={(values) => {
                        const c = { ...currentCell, gene_selection: values };
                        cells.set(currentCell.cell_type, c);
                        setCurrentCell(c);
                    }} />
                    <TagsInput placeholder="Add new genes" label="Add new genes"
                    value={currentCell.new_genes ?? []} onChange={(values) => {
                        const c = { ...currentCell, new_genes: values };
                        cells.set(currentCell.cell_type, c);
                        setCurrentCell(c);
                    }} />
                </Stack>
            </Drawer>
        </>
    );
}