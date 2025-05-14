import { useEffect, useState } from "react";
import { api_instance, Cell } from "./api";
import { Badge, Button, CloseButton, Drawer, MultiSelect, NavLink, Stack, Switch, TagsInput, TextInput } from "@mantine/core";
import { IconCheckbox, IconChevronRight, IconClearAll, IconFileImport, IconPlus, IconSearch } from "@tabler/icons-react";
import { get_key, is_valid } from "./utils";
import { useDisclosure, useMap } from "@mantine/hooks";

interface CellsSelectionProps {
    tissue: string;
    repos: string[];
    onCellsSelected: (cells: Cell[]) => void;
    cells: Cell[];
}

function extractSelected(cells : Map<string, Cell>) : Cell[] {
    return [...cells.values()].filter(hasSelectedGenes);
}

function hasSelectedGenes(cell: Cell) {
    return cell.is_selected || is_valid(cell.gene_selection) || is_valid(cell.new_genes);
}

function setSelection(cells : Cell[], is_selected: boolean, map : Map<string, Cell>) {
    for(const element of cells) {
        const c = { ...element, is_selected: is_selected };
        map.set(c.cell_type, c);
    }
}

export function CellsSelection(props: Readonly<CellsSelectionProps>) {
    const [search, setSearch] = useState("");
    const [currentCell, setCurrentCell] = useState<Cell>({cell_type: "new", genes:[], is_selected: false, new_genes:[]});

    const cells = useMap<string, Cell>(props.cells.map((item) => [item.cell_type, item]));


    useEffect(() => {
        if (props.repos.length == 0) {
            return;
        }
        api_instance
        .get_cells(props.tissue, props.repos)
        .then((rcells) => rcells.map((entry) => !cells.has(entry.cell_type) && cells.set(entry.cell_type, entry)));
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
                    <Badge size="md" color={hasSelectedGenes(item) ? "blue" : "yellow"} circle>
                        {(item.is_selected ? item.genes.length : (item.gene_selection?.length ?? 0)) + (item.new_genes?.length ?? 0)}
                    </Badge>
                }
                rightSection={<IconChevronRight />}
                />);
    });

    return (
        <>
            <Stack>
                <TextInput value={search} width="100%" label="Search for or add a cell" placeholder="Type a name of a cell type" 
                    onChange={(event) => setSearch(event.currentTarget.value)} leftSection={<IconSearch />} 
                    rightSection={
                        (search !== '') && (
                            <CloseButton
                                size="sm"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => {
                                    setSearch('');
                                }}
                                aria-label="Clear value"
                            />
                        )
                    }
                />
                <Button.Group>
                    <Button variant="filled" color="green" disabled={!search || cells.has(search)} onClick={() => 
                        !cells.has(search) && cells.set(search, {cell_type: search, is_selected: false, genes:[], new_genes:[]})
                    }><IconPlus/>Add as new cell</Button>
                    <Button variant="light" onClick={()=> setSelection(filteredCells, true, cells)}><IconCheckbox/>Select all</Button>
                    <Button variant="outline" onClick={()=> setSelection(filteredCells, false, cells)}><IconClearAll/>Deselect all</Button>
                    <Button variant="filled" onClick={() => props.onCellsSelected(extractSelected(cells))}><IconFileImport/>Save Selection</Button>
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