import { NavLink } from "@mantine/core";
import { Stage } from "./Stage";
import React from "react";
import { IconChevronRight } from "@tabler/icons-react";

interface MyNavProps {
    label: string;
    disabled?: boolean;
    active: boolean;
    leftSection: React.ReactNode;
    onClick: () => void;
}

export function MyNav(props : MyNavProps) {
    return (<NavLink
          href="#required-for-focus"
          label={props.label}
          leftSection={props.leftSection}
          rightSection={
            <IconChevronRight size="0.8rem" stroke={1.5} className="mantine-rotate-rtl" />
          }
          disabled={props.disabled}
          active={props.active}
          onClick={() => props.onClick()}
        />);
}