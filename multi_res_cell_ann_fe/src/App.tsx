import { useState } from 'react'
import '@mantine/core/styles.css';
import { FileInput, MantineProvider, Stack , AppShell, Burger, Group, FileButton, Button, Text } from '@mantine/core';
import { useDisclosure, useMap } from '@mantine/hooks';
import { IconActivityHeartbeat, IconDatabase, IconCell, IconSettings, IconMatrix, IconAnalyze, IconDownload } from '@tabler/icons-react';
import { saveAs } from 'file-saver';

import { Stage , CurrentState, to_export, from_export } from './Stage';
import { Sources } from './sources'
import { MyNav } from './MyNav';
import { SelectTissue } from './SelectTissue';
import { SelectedRepo } from './SelectRepo';
import { NavButtons } from './NavButtons';
import { CellsSelection } from './Cells';
import { SettingsOptions } from './Settings';
import { Activity, api_instance, default_settings, FeedbackModel, SessionResp } from './api';
import { Feedback } from './Feedback';

function App() {

  const [opened, { toggle }] = useDisclosure(true);
  const [status, setStatus] = useState<CurrentState>({stage: Stage.Tissue, selectedRepo : [], selectTissue: "", source: Sources.Database, cells: [] });

  const moveStage=(stage: Stage) => setStatus({...status, stage: stage});

  const activityLog = useMap<Activity, FeedbackModel>();
  return (
    <MantineProvider>
      <AppShell
        header={{ height: { base: 60, md: 70, lg: 80 }, offset: true }}
        footer={{height: {base: 60, md: 70, lg: 80}, offset: true}}
        navbar={{
          width: { base: 200, md: 300, lg: 400 },
          breakpoint: 'md',
          collapsed: { mobile: !opened, desktop: !opened },
        }}
        layout='alt'
        padding={{ base: 30, sm: 15, lg: 'xl' }}
      >
        <AppShell.Header>
        <Group h="100%" px="md">
          <Burger
            opened={opened}
            onClick={toggle}
            size="sm"
          />
          <Text fw={700}>Multi-resource single cell RNA sequence (scRNA-seq) dataset cell annotation</Text>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
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
        </AppShell.Navbar>

        <AppShell.Main>
          <Stack align='stretch' justify="flex-start">
            {status.stage == Stage.Repo &&
              <SelectedRepo selectedRepo={status.selectedRepo} tissue={status.selectTissue} onChange={(selected) => { setStatus({ ...status, selectedRepo: selected, cells: [] }); }} />
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
                onChange={payload => {

                  async function create_session(status: CurrentState) {
                    
                    const response : SessionResp= await api_instance.create_session(status.settings ?? default_settings(), status.cells);
                    console.log("create session", response);
                    activityLog.set(Activity.NONE, {activity: Activity.NONE, finished: new Date(), duration:-1});
                    console.log("save start activity in state");
                    await api_instance.analyze(response.session, payload)
                      .then(resp => resp.json())
                      .then((r: FeedbackModel) => activityLog.set(Activity.UPLOAD_DATASET, r));
                    console.log("uploaded file");
                    setStatus({...status, session_id: response.session, dataset: payload });
                    console.log("save session in state");
                  }
                  create_session(status);
                }}
              />
            }
            {status.stage == Stage.Analysis && status.session_id && <Feedback analysisSocket={api_instance.get_analysis_socket(status.session_id)} activityLog={activityLog}  />}
          </Stack>
        </AppShell.Main>
        <AppShell.Footer>
          <Group justify='left'>
            <FileButton accept='application/json' onChange={(payload) => {
              if (payload) {
                payload.text()
                .then(t => JSON.parse(t))
                .then((t : CurrentState) => setStatus(from_export(t)));
              }
            }}>
              {(props) => <Button {...props}>Import session</Button>}
            </FileButton>
            <Button variant="filled" rightSection={<IconDownload size={14} />} onClick={() =>{
              const js : Blob = new Blob([JSON.stringify(to_export(status))]);
              saveAs(js, "session.json");
            }}>Save session</Button>
            
            <NavButtons currentStatus={status}  next={(nextStage) => moveStage(nextStage)} prev={(prevStage) => moveStage(prevStage)} />
          </Group>
        </AppShell.Footer>
      </AppShell>

    </MantineProvider>
  )
}

export default App
