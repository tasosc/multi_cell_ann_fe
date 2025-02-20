import { useEffect, useRef, useState } from "react";
import { Activity, api_instance, BackendApi, FeedbackModel } from "./api";
import { Timeline, Text, Grid, Image, Loader, ScrollArea, ScrollAreaAutosize, Stack, Anchor, Title, Tree, Table } from "@mantine/core";
import { IconCell, IconChartArea, IconEyeCheck, IconIdBadge, IconLink, IconMatrix, IconSelector, IconTransform, IconVariable } from "@tabler/icons-react";
import { useMap } from "@mantine/hooks";

interface FeedbackProps {
    session_id: string;
    activityLog: Map<Activity, FeedbackModel>
}
interface TimeLineInfoProps {
    feedback?: FeedbackModel
}
interface MessageLog {
    is_image: boolean;
    image?: string
    text?: string
    is_heading: boolean
}
interface MessageLogProps {
    messageLog : MessageLog
}

function MessageLogRender (props : Readonly<MessageLogProps>){
    if (props.messageLog.is_image && props.messageLog.image) {
        console.log("rendering image")
       //return (<Image src={URL.createObjectURL(props.messageLog.image)} onLoad={(event) => URL.revokeObjectURL(event.currentTarget.src)} alt="diagram" />);
       return (<div dangerouslySetInnerHTML={{__html: props.messageLog.image}}/>);
    }
    if (props.messageLog.is_heading) {
        return (<Title order={4}>{props.messageLog.text}</Title>);
    }

    const word = /^[a-zA-Z0-9]/;
    const text = props.messageLog.text?.trim();
    
    if (text && !word.test(text)) {
        const stext = text.charAt(0);
        if (stext == "<") {
            console.log("Rendering html");
            return (<div dangerouslySetInnerHTML={{ __html: text }} />) 
        }
        else if (stext == "[") {
            console.log("Rendering json");
            const j = JSON.parse(text);
            return (<Table data={{body: j}} />);
        }
    }
    console.log("Rendering text");
    return (<Text>{text}</Text>);
}

function TimeLineInfo(props: Readonly<TimeLineInfoProps>) {
    const feedback = props.feedback;
    if (!feedback) {
        return (<Text c="dimmed" size="sm">Pending</Text>)
    }
    if (!feedback.finished) {
        console.log("Error getting feedback" , feedback);
        return (<Loader color="red">feedback</Loader>);
    }
    const finished: Date = feedback.finished instanceof Date? feedback.finished : new Date(feedback.finished)
    
    return (<>
        <Text c="dimmed" size="sm">{feedback.message}</Text>
        <Text size="xs" mt={4}>Finished at {finished.toLocaleTimeString()}</Text>
       {feedback.duration > 0 && <Text size="xs" mt={4}>Duration {feedback.duration} seconds</Text> }
       {feedback.link  && <Anchor href={api_instance.build_download_link(feedback.link)} target="_blank">{feedback.message}</Anchor> }
    </>);
}

const activity_order = [Activity.NONE,
    Activity.UPLOAD_DATASET,
    Activity.PARSE_DATASET,
    Activity.PP_QC,
    Activity.PP_NORM,
    Activity.PP_FEATURE,
    Activity.PP_REDUCTION,
    Activity.PP_VISUALIAZTION,
    Activity.SI_CLUSTERING,
    Activity.SI_ANNOTATION,
    Activity.SI_FILE,
    Activity.END];

function get_activity(feedback: FeedbackModel) : number{
    if (feedback?.activity) {
        console.log("Get index for activity: ", feedback.activity,"index", activity_order.indexOf(feedback.activity))
        return activity_order.indexOf(feedback.activity);
    }
    console.log("Could not parse feedback:", feedback);
    return 0;
}
export function Feedback(props: Readonly<FeedbackProps>) {
    const api = new BackendApi();
    const activityLog = useMap<Activity, FeedbackModel>(Array.from(props.activityLog));

    const [messages, setMessages] = useState<MessageLog[]>([]);
    const [active, setActive] = useState(1);
    const [webSocketReady, setWebSocketReady] = useState(false);
    useEffect(() => {
            if (webSocketReady) {
                console.log("Web socket already initialized but entering again");
            } 
            else {
                const webSocket = api.open_socket(props.session_id);
                webSocket.onopen = () => setWebSocketReady(true);

                webSocket.onmessage = function (event) {
                    if (event.data instanceof ArrayBuffer) {
                        console.log("array buf received");
                        const buf: ArrayBuffer = event.data;
                        const b = new Blob([buf], { type: "image/svg+xml" })
                      //  setMessages((msgs) => [...msgs, { is_image: true, image: b, is_heading: false }]);
                    }
                    else if (event.data instanceof Blob) {
                        console.log("blob received");
                        event.data.text().then(svg =>  setMessages((msgs) => [...msgs, { is_image: true, image: svg, is_heading: false }]));
                        // setMessages((msgs) => [...msgs, { is_image: true, image: event.data, is_heading: false }]);
                    }
                    else {
                        console.log("Message received: ", event.data)
                        const feedback: FeedbackModel = JSON.parse(event.data);
                        if (feedback.activity != Activity.NONE) {
                            activityLog.set(feedback.activity, feedback);
                            setActive(get_activity(feedback))
                            setMessages((msgs) => [...msgs, { is_image: false, is_heading: true, text: feedback.message ?? feedback.activity }]);
                        }
                        else {
                            setMessages((msgs) => [...msgs, { is_image: false, text: feedback.message, is_heading: false }]);
                        }
                    }
                };

                webSocket.onclose = function (event) {
                    setWebSocketReady(false);
                    console.log("Code", event.code);
                    if (event.code > 1003) {
                        console.log("Error ", event);
                        // return;
                    }
                    if (active > -1 && activity_order[active] == Activity.END) {
                        return;
                    }
                    setTimeout(() => {

                        // setWebSocket(api.open_socket(props.session_id));
                    }, 3000);

                };

                webSocket.onerror = function (err) {
                    console.log('Socket encountered error: ', err, 'Closing socket');
                    if (webSocketReady) {
                        setWebSocketReady(false);
                        webSocket.close();
                    }
                };
                return () => {
                    if (webSocketReady) {
                        webSocket.close();
                    }
                };
            }
    });
    let index: number = 0;
    const log = messages.map(message => <MessageLogRender key={`MSGLR_${index++}`} messageLog={message} />);

    return (
        <Grid grow>
            <Grid.Col span={4}>
                <Timeline active={active} bulletSize={24} lineWidth={2}>
                    <Timeline.Item bullet={<IconCell size={12} />} title="Selected cells">
                        <TimeLineInfo feedback={activityLog.get(Activity.NONE)} />
                    </Timeline.Item>
                    <Timeline.Item bullet={<IconMatrix size={12} />} title="Uploaded dataset">
                        <TimeLineInfo feedback={activityLog.get(Activity.UPLOAD_DATASET)} />
                    </Timeline.Item>
                    <Timeline.Item bullet={<IconMatrix size={12} />} title="Parse dataset">
                        <TimeLineInfo feedback={activityLog.get(Activity.PARSE_DATASET)} />
                    </Timeline.Item>
                    <Timeline.Item bullet={<IconEyeCheck size={12} />} title="Pre-processing: Quality Control">
                        <TimeLineInfo feedback={activityLog.get(Activity.PP_QC)} />
                    </Timeline.Item>
                    <Timeline.Item bullet={<IconTransform size={12} />} title="Pre-processing: Normalization">
                        <TimeLineInfo feedback={activityLog.get(Activity.PP_NORM)} />
                    </Timeline.Item>
                    <Timeline.Item bullet={<IconSelector size={12} />} title="Pre-processing: Feature Selection">
                        <TimeLineInfo feedback={activityLog.get(Activity.PP_FEATURE)} />
                    </Timeline.Item>
                    <Timeline.Item bullet={<IconChartArea size={12} />} title="Pre-processing: Visualization">
                        <TimeLineInfo feedback={activityLog.get(Activity.PP_VISUALIAZTION)} />
                    </Timeline.Item>
                    <Timeline.Item bullet={<IconVariable size={12} />} title="Structure Identification: Clustering">
                        <TimeLineInfo feedback={activityLog.get(Activity.SI_CLUSTERING)} />
                    </Timeline.Item>
                    <Timeline.Item bullet={<IconIdBadge size={12} />} title="Structure Identification: Annotation">
                        <TimeLineInfo feedback={activityLog.get(Activity.SI_ANNOTATION)} />
                    </Timeline.Item>
                    <Timeline.Item bullet={<IconLink size={12} />} title="File">
                        <TimeLineInfo feedback={activityLog.get(Activity.SI_FILE)} />
                    </Timeline.Item>
                </Timeline>
            </Grid.Col>
            <Grid.Col span={8}>
                <ScrollArea type="always">
                        {log}
                </ScrollArea>
            </Grid.Col>
        </Grid>
    );
}