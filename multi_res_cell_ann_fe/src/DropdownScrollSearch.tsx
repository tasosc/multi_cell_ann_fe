import { useState } from 'react';
import { Combobox, TextInput, useCombobox } from '@mantine/core';

interface DropdownScrollProps {
  tissues: string[];
  selectedTissue: string;
  onChange: (current: string) => void;
}

export function DropdownScroll(props: DropdownScrollProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [value, setValue] = useState(props.selectedTissue);
  const shouldFilterOptions = !props.tissues.some((item) => item === value);
  const filteredOptions = shouldFilterOptions
    ? props.tissues.filter((item) => item.toLowerCase().includes(value.toLowerCase().trim()))
    : props.tissues;

  const options = filteredOptions.map((item) => (
    <Combobox.Option value={item} key={item}>
      {item}
    </Combobox.Option>
  ));

  return (
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
          label="Pick a tissue or type anything"
          placeholder="Pick a tissue or type anything"
          value={value}
          onChange={(event) => {
            props.onChange(event.currentTarget.value);
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options mah={200} style={{ overflowY: 'auto' }}>
          {options.length === 0 ? <Combobox.Empty>Nothing found</Combobox.Empty> : options}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}