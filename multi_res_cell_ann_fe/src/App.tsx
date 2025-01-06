import { useEffect, useState } from 'react'
import '@mantine/core/styles.css';
import { FileInput, MantineProvider } from '@mantine/core';
import { AppShell, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconHome2,  IconFileImport, IconActivityHeartbeat } from '@tabler/icons-react';
import { Stage } from './Stage';
import { CurrentState } from './Stage';
import { SelectedSource } from './SelectSource'
import { MyNav } from './MyNav';
import { BackendApi } from './api';
import { DropdownScroll } from './DropdownScrollSearch';
function App() {

  let api = new BackendApi("http://localhost:8000");
  const [opened, { toggle }] = useDisclosure();
  const [status, setStatus] = useState<CurrentState>({stage: Stage.Source, selectedSource : "", selectTissue: "" });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [tissues, setTissues] = useState<string[]>([]);

  useEffect(() => {
    api.get_tissues(setTissues);
  }, []);

  return (
	  <MantineProvider>
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
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
          disabled={status.selectedSource != "import"}
          active={status.stage == Stage.ImportFile}
          onClick={() => setStatus({...status, stage: Stage.ImportFile})}
        />
        <MyNav 
          label='Select tissue'
          leftSection={<IconActivityHeartbeat size="1rem" stroke={1.5} />}
          disabled={!status.selectedSource}
          active={status.stage == Stage.Tissue}
          onClick={() => setStatus({...status, stage: Stage.Tissue})}
        />
       </AppShell.Navbar>

      <AppShell.Main>
        { status.stage == Stage.Source &&
           <SelectedSource selectedSource={status.selectedSource} onChange={(target, new_stage) => {console.log(target); setStatus({...status, stage: new_stage, selectedSource: target});}}/>
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
           tissues={tissues}
           selectedTissue={status.selectTissue}
           onChange={(current) => setStatus({...status, selectTissue: current})}
          />
        }
      </AppShell.Main>
    </AppShell>

	  </MantineProvider>
  )
}

export default App
