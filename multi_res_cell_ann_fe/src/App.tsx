import { useState } from 'react'
import '@mantine/core/styles.css';
import { FileInput, MantineProvider } from '@mantine/core';
import { AppShell, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconHome2,  IconFileImport, IconActivityHeartbeat } from '@tabler/icons-react';
import { Stage } from './Stage';
import { CurrentState } from './Stage';
import { SelectedSource } from './SelectSource'
import { MyNav } from './MyNav';
function App() {


  const [opened, { toggle }] = useDisclosure();
  const [status, setStatus] = useState<CurrentState>({stage: Stage.Source, selectedSource : "" });
  const [importFile, setImportFile] = useState<File | null>(null);
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
          onClick={() => setStatus({stage: Stage.Source, selectedSource: status.selectedSource})}
        />
        <MyNav
          label="Import cells and genes"
          leftSection={<IconFileImport size="1rem" stroke={1.5} />}
          disabled={status.selectedSource != "import"}
          active={status.stage == Stage.ImportFile}
          onClick={() => setStatus({stage: Stage.ImportFile, selectedSource: status.selectedSource})}
        />
        <MyNav 
          label='Select tissue'
          leftSection={<IconActivityHeartbeat size="1rem" stroke={1.5} />}
          disabled={!status.selectedSource}
          active={status.stage == Stage.Tissue}
          onClick={() => setStatus({stage: Stage.Tissue, selectedSource: status.selectedSource})}
        />
       </AppShell.Navbar>

      <AppShell.Main>
        { status.stage == Stage.Source &&
           <SelectedSource selectedSource={status.selectedSource} onChange={(target, new_stage) => {console.log(target); setStatus({stage: new_stage, selectedSource: target});}}/>
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
      </AppShell.Main>
    </AppShell>

	  </MantineProvider>
  )
}

export default App
