import { useState } from 'react'
import '@mantine/core/styles.css';
import { FileInput, MantineProvider, ScrollArea, Stack , AppShell, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconHome2,  IconFileImport, IconActivityHeartbeat, IconDatabase, IconCell, IconSettings, IconMatrix, IconAnalyze, IconSettingsAutomation, IconReportMedical } from '@tabler/icons-react';
import { Stage , CurrentState } from './Stage';
import { SelectedSource, Sources } from './SelectSource'
import { MyNav } from './MyNav';
import { SelectTissue } from './SelectTissue';
import { SelectedRepo } from './SelectRepo';
import { NavButtons } from './NavButtons';
import { CellsSelection } from './Cells';
import { SettingsOptions } from './Settings';
import { Analysis } from './Analysis';
import { default_settings } from './api';
function App() {

  const [opened, { toggle }] = useDisclosure();
  const [status, setStatus] = useState<CurrentState>({stage: Stage.Source, selectedRepo : [], selectTissue: "", source: Sources.None, cells: [] });
  const [importFile, setImportFile] = useState<File | null>(null);

  const moveStage=(stage: Stage) => setStatus({...status, stage: stage});

  return (
    <MantineProvider>
      <AppShell
        header={{ height: { base: 60, md: 70, lg: 80 }, offset: true }}
        footer={{height: {base: 60, md: 70, lg: 80}, offset: true}}
        navbar={{
          width: { base: 200, md: 300, lg: 400 },
          breakpoint: 'md',
          collapsed: { mobile: !opened },
        }}
        layout='alt'
        padding={{ base: 30, sm: 15, lg: 'xl' }}
      >
        <AppShell.Header>
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
          />
          <div><b>Multi-resource</b></div>
          <div><b>Multi-resource single cell RNA sequence (scRNA-seq) dataset cell annotation</b></div>
        </AppShell.Header>

        <AppShell.Navbar p="md">Navbar
          <MyNav
            label="Select source"
            leftSection={<IconHome2 size="1rem" stroke={1.5} />}
            active={status.stage == Stage.Source}
            onClick={() => setStatus({ ...status, stage: Stage.Source })}
            description={`Current source: ${Sources[status.source]}`}
          />
          <MyNav
            label="Import cells and genes"
            leftSection={<IconFileImport size="1rem" stroke={1.5} />}
            disabled={status.source != Sources.Import}
            active={status.stage == Stage.ImportFile}
            onClick={() => setStatus({ ...status, stage: Stage.ImportFile })}
            description={status.source == Sources.Import ? "Import file" : "Disabled. Database selected"}
          />
          <MyNav
            label='Select tissue'
            leftSection={<IconActivityHeartbeat size="1rem" stroke={1.5} />}
            disabled={status.source != Sources.Database && !status.selectTissue}
            active={status.stage == Stage.Tissue}
            onClick={() => setStatus({ ...status, stage: Stage.Tissue })}
            description={`Current tissue: ${status.selectTissue}`}
          />
          <MyNav
            label='Select Repository'
            leftSection={<IconDatabase size="1rem" stroke={1.5} />}
            disabled={status.source != Sources.Database || !status.selectTissue}
            active={status.stage == Stage.Repo}
            onClick={() => setStatus({ ...status, stage: Stage.Repo })}
            description={status.source == Sources.Database ? `Selected repo: ${status.selectedRepo}` : "Disabled. Import from file."}
          />
          <MyNav
            label="Select cell repository"
            leftSection={<IconCell size="1rem" stroke={1.5} />}
            disabled={!status.selectTissue || (status.selectedRepo.length == 0 && status.source == Sources.Database)}
            active={status.stage == Stage.Cell}
            onClick={() => setStatus({ ...status, stage: Stage.Cell })}
            description={`${status.cells.length} cells selected`}
          />
          <MyNav
            label="Settings"
            leftSection={<IconSettings size="1rem" stroke={1.5} />}
            disabled={status.cells.length == 0}
            active={status.stage == Stage.Settings}
            onClick={() => setStatus({ ...status, stage: Stage.Settings })}
          />
          <MyNav
            label="Upload scRNA seq dataset"
            leftSection={<IconMatrix size="1rem" stroke={1.5} />}
            disabled={status.cells.length == 0 || !status.selectTissue}
            active={status.stage == Stage.File}
            onClick={() => setStatus({ ...status, stage: Stage.File })}
            description={!status.dataset ? "No scRNA-seq file loaded" : `Dataset: ${status.dataset.name}`}
          />
          <MyNav
            label="Analysis"
            leftSection={<IconAnalyze size="1rem" stroke={1.5} />}
            disabled={status.cells.length == 0 || !status.selectTissue}
            active={status.stage == Stage.Analysis}
            onClick={() => setStatus({ ...status, stage: Stage.Analysis })}
          />
          <MyNav
            label="Results"
            leftSection={<IconReportMedical size="1rem" stroke={1.5} />}
            disabled={false}
            active={status.stage == Stage.Completed}
            onClick={() => setStatus({ ...status, stage: Stage.Completed })}
          />
        </AppShell.Navbar>

        <AppShell.Main>
          <Stack align='stretch' justify="flex-start">
            {status.stage == Stage.Source &&
              <SelectedSource currentSource={status.source} onChange={(target) => { setStatus({ ...status, source: target }); }} />
            }
            {status.stage == Stage.Repo &&
              <SelectedRepo selectedRepo={status.selectedRepo} tissue={status.selectTissue} onChange={(selected) => { setStatus({ ...status, selectedRepo: selected, cells: [] }); }} />
            }
            {status.stage == Stage.ImportFile &&
              <FileInput
                rightSection={<IconSettingsAutomation/>}
                accept='application/json'
                radius="md"
                value={importFile}
                label="Select previously saved cells"
                description="Import previously saved cell and gene selection"
                placeholder="Select previously saved cells and genes"
                onChange={(payload) => {
                  if (payload) {
                    payload
                    .text()
                    .then(value => JSON.parse(value))
                    .then(json => console.log(json));
                  }
                  return setImportFile(payload);
                }}
              />
            }
            {status.stage == Stage.Tissue &&
              <SelectTissue
                selectedTissue={status.selectTissue}
                onChange={(current) => setStatus({ ...status, selectTissue: current, selectedRepo: [], cells: [] })}
              />
            }
            {status.stage == Stage.Cell &&
              <CellsSelection repos={status.selectedRepo} cells={status.cells} tissue={status.selectTissue} onCellsSelected={(cells) => setStatus({ ...status, cells: cells })} />
            }
            {status.stage == Stage.Settings && <SettingsOptions settings={status.settings} onSave={settings => setStatus({...status, settings: settings})} /> }
            {status.stage == Stage.File &&
              <FileInput
                radius="md"
                value={status.dataset}
                label="scRNA-seq dataset"
                description="The application supports .h5ad, .txt and .csv files. The csv files can be compressed with gzip.By default it will use predefined Prostate test data."
                placeholder="Upload a scRNA-seq dataset"
                onChange={payload => setStatus({ ...status, dataset: payload })}
              />
            }
            {status.stage == Stage.Analysis && <Analysis cells={status.cells} settings={status.settings ?? default_settings()} dataset={status.dataset} onSessionChange={(session) => console.log(session)}/>}
          </Stack>
        </AppShell.Main>
        <AppShell.Footer>
            <NavButtons currentStatus={status}  next={(nextStage) => moveStage(nextStage)} prev={(prevStage) => moveStage(prevStage)} />
        </AppShell.Footer>
      </AppShell>

    </MantineProvider>
  )
}

export default App
