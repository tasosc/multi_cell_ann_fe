import { Button, Group } from "@mantine/core";
import { Stage } from "./Stage";

interface NavButtonsProps {
    next?: () => void;
    prev?: () => void;
    disabled?: boolean
}

export function NavButtons(props: NavButtonsProps) {
    return (<Group justify="center" mt="xl">
        <Button disabled={props.disabled || !props.prev} variant="default" onClick={props.prev}>
            Back
        </Button>
        <Button disabled={props.disabled || !props.next} onClick={props.next}>
            Next Step
        </Button>
    </Group>); 
}