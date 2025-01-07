import { useEffect, useState } from 'react';
import { ActionIcon, CloseButton, Combobox, Group, Stack, TextInput, useCombobox } from '@mantine/core';
import { BackendApi } from './api';
import { IconArrowNarrowRight } from '@tabler/icons-react';

interface DropdownScrollProps {
  selectedTissue: string;
  onChange: (current: string) => void;
}

export function DropdownScroll(props: DropdownScrollProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  let api = new BackendApi();
  const [value, setValue] = useState(props.selectedTissue);
  const [loading, setLoading] = useState(false);
  const [tissues, setTissues] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (tissues.length == 0 && !loading) {
      setLoading(true);
      api.get_tissues()
        .then((value: string[]) => {
          setLoading(false);
          setTissues(value);
        });
    }
  }, []);
  const shouldFilterOptions = tissues.every((item) => item !== search);
  const filteredOptions = shouldFilterOptions
    ? tissues.filter((item) => item.toLowerCase().includes(search.toLowerCase().trim()))
    : tissues;

  const options = filteredOptions.map((item) => (
    <Combobox.Option value={item} key={item}>
      {item}
    </Combobox.Option>
  ));
  console.log(`value: ${value}`);
  console.log(`search: ${search}`);
  console.log(`shouldFilterOptions: ${shouldFilterOptions}`);

  return (
    <Stack align="stretch" justify="center">
      <Combobox
        onOptionSubmit={(optionValue) => {
          setValue(optionValue);
          combobox.closeDropdown();
        }}
        store={combobox}
        withinPortal={false}
      >
        <Combobox.Target>
          <TextInput
            label="Pick a tissue or search for one"
            placeholder="Pick a tissue or search for one"
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
              combobox.openDropdown();
              combobox.updateSelectedOptionIndex();
            }}
            onClick={() => combobox.openDropdown()}
            onFocus={() => combobox.openDropdown()}
            onBlur={() => combobox.closeDropdown()}
            rightSection={
              (value !== '' || search !== '') && (
                <CloseButton
                  size="sm"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setValue('');
                    setSearch('');
                  }}
                  aria-label="Clear value"
                />
              )
            }
          />
        </Combobox.Target>

        <Combobox.Dropdown>
          <Combobox.Options mah={200} style={{ overflowY: 'auto' }}>
            {loading && <Combobox.Empty>Loading....</Combobox.Empty>}
            {!loading && options.length === 0 ? <Combobox.Empty>Nothing found</Combobox.Empty> : options}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
      <ActionIcon size="lg" variant='filled' color='green' aria-label='Submit' onClick={() => props.onChange(value)}>
        <IconArrowNarrowRight />
      </ActionIcon>
    </Stack>

  );
}