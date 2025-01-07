import { useState } from 'react'
import '@mantine/core/styles.css';
import { FileInput, Group, MantineProvider } from '@mantine/core';
import { AppShell, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconHome2,  IconFileImport, IconActivityHeartbeat, IconDatabase } from '@tabler/icons-react';
import { Stage } from './Stage';
import { CurrentState } from './Stage';
import { SelectedSource, Sources } from './SelectSource'
import { MyNav } from './MyNav';
import { DropdownScroll } from './DropdownScrollSearch';
import { SelectedRepo } from './SelectRepo';
function App() {

  const [opened, { toggle }] = useDisclosure();
  const [status, setStatus] = useState<CurrentState>({stage: Stage.Source, selectedRepo : [], selectTissue: "", source: Sources.None });
  const [importFile, setImportFile] = useState<File | null>(null);


  return (
	  <MantineProvider>
    <AppShell
      header={{ height: { base: 60, md: 70, lg: 80 } }}
      navbar={{
        width: { base: 200, md: 300, lg: 400 },
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom="sm"
          size="sm"
        />
        <div>Logo</div>
      </AppShell.Header>

      <AppShell.Navbar p="md">Navbar
        <MyNav
          label="Select source"
          leftSection={<IconHome2 size="1rem" stroke={1.5} />}
          active={status.stage == Stage.Source}
          onClick={() => setStatus({...status, stage: Stage.Source})}
        />
        <MyNav
          label="Import cells and genes"
          leftSection={<IconFileImport size="1rem" stroke={1.5} />}
          disabled={status.source != Sources.Import}
          active={status.stage == Stage.ImportFile}
          onClick={() => setStatus({...status, stage: Stage.ImportFile})}
        />
        <MyNav 
          label='Select tissue'
          leftSection={<IconActivityHeartbeat size="1rem" stroke={1.5} />}
          disabled={status.source != Sources.Database || !status.selectTissue}
          active={status.stage == Stage.Tissue}
          onClick={() => setStatus({...status, stage: Stage.Tissue})}
        />
        <MyNav
          label="Select cell repository"
          leftSection={<IconDatabase size="1rem" stroke={1.5} />}
          disabled={status.selectedRepo.length == 0 && status.source == Sources.Database }
          active={status.stage == Stage.Cell}
          onClick={() => setStatus({...status, stage: Stage.Cell})}
        />
       </AppShell.Navbar>

      <AppShell.Main>
        { status.stage == Stage.Source &&
           <SelectedSource  currentSource={status.source} onChange={(target, new_stage) => {setStatus({...status, stage: new_stage, source: target});}}/>
        }
        { status.stage == Stage.Repo &&
           <SelectedRepo  selectedRepo={status.selectedRepo} tissue={status.selectTissue} onChange={(selected, new_stage) => {setStatus({...status, stage: new_stage, selectedRepo: selected});}}/>
        }
        { status.stage == Stage.ImportFile && 
          <FileInput
            radius="md"
            value={importFile}
            label="Select previously saved cells"
            description="Import previously saved cell and gene selection"
            placeholder="Select previously saved cells and genes"
            onChange={setImportFile}
          />
        }
        { status.stage == Stage.Tissue &&
          <DropdownScroll 
           selectedTissue={status.selectTissue}
           onChange={(current) => setStatus({...status, selectTissue: current, stage: Stage.Cell})}
          />
        }
      </AppShell.Main>
    </AppShell>

	  </MantineProvider>
  )
}

export default App
