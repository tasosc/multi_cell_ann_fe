import { Button, Group } from "@mantine/core";
import { CurrentState, Stage } from "./Stage";
import { get_disabled, get_next_stage, get_prev_stage } from "./router";

interface NavButtonsProps {
    next: (nextStage: Stage) => void;
    prev: (prevStage: Stage) => void;

    currentStatus: CurrentState
}

export function NavButtons(props: Readonly<NavButtonsProps>) {
    const nextStage = get_next_stage({currentStatus: props.currentStatus});
    const prevStage = get_prev_stage({currentStatus: props.currentStatus});
    const disable = get_disabled({currentStatus: props.currentStatus});

    return (<Group justify="center">
        <Button disabled={prevStage === null} variant="default" onClick={() => prevStage && props.prev(prevStage)}>
            Back
        </Button>
        <Button disabled={disable || !nextStage} onClick={() => nextStage && props.next(nextStage) }>
            Next Step
        </Button>
    </Group>); 
}