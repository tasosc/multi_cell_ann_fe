import { useEffect, useState } from "react";
import { BackendApi, Cell } from "./api";
import { Badge, Button, Drawer, MultiSelect, NavLink, Stack, Switch, TagsInput, TextInput } from "@mantine/core";
import { IconCheckbox, IconChevronRight, IconClearAll, IconFileImport, IconPlus, IconSearch } from "@tabler/icons-react";
import { get_key, is_valid } from "./utils";
import { useDisclosure, useMap } from "@mantine/hooks";

interface CellsSelectionProps {
    tissue: string;
    repos: string[];
    onCellsSelected: (cells: Cell[]) => void;
}

function extractSelected(cells : Map<string, Cell>) : Cell[] {
    return [...cells.values()].filter((cell) => cell.is_selected || is_valid(cell.gene_selection) || is_valid(cell.new_genes));
}

function setSelection(cells : Cell[], is_selected: boolean, map : Map<string, Cell>) {
    for(let i=0; i< cells.length; i++) {
        const c = { ...cells[i], is_selected: is_selected };
        map.set(c.cell_type, c);
    }
}

export function CellsSelection(props: CellsSelectionProps) {
    const api = new BackendApi();
    const [search, setSearch] = useState("");
    const [currentCell, setCurrentCell] = useState<Cell>({cell_type: "new", genes:[], is_selected: false, new_genes:[]});

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
                <Button.Group>
                    <Button variant="filled" color="green" disabled={!search} onClick={() => 
                        !cells.has(search) && cells.set(search, {cell_type: search, is_selected: false, genes:[], new_genes:[]})
                    }><IconPlus/>Add as new cell</Button>
                    <Button variant="light" onClick={()=> setSelection(filteredCells, true, cells)}><IconCheckbox/>Select all</Button>
                    <Button variant="outline" onClick={()=> setSelection(filteredCells, true, cells)}><IconClearAll/>Deselect all</Button>
                    <Button variant="filled" disabled={!search} onClick={() => props.onCellsSelected(extractSelected(cells))}><IconFileImport/>Save Selection</Button>
                </Button.Group>
                {options}
            </Stack>

            <Drawer position="right" offset={8} radius="md" opened={opened} onClose={close} title={`Select Genes for cell ${currentCell.cell_type}`} >
                <Stack>
                    <Switch checked={currentCell.is_selected ?? false} onChange={(event) => {
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