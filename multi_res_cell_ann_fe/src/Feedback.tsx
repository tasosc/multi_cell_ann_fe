import { useEffect, useState } from "react";
import { Activity, AnalysisSocket, api_instance, FeedbackModel } from "./api";
import { Timeline, Text, Loader, Anchor } from "@mantine/core";
import { IconCell, IconChartArea, IconEyeCheck, IconIdBadge, IconLink, IconMatrix, IconSelector, IconTransform, IconVariable } from "@tabler/icons-react";
import { useMap } from "@mantine/hooks";

interface FeedbackProps {
    analysisSocket: AnalysisSocket
    activityLog: Map<Activity, FeedbackModel>
}
interface TimeLineInfoProps {
    feedback?: FeedbackModel
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
       {feedback.link  && <Anchor href={api_instance.build_download_link(feedback.link)} target="_blank">Click to download Dataset</Anchor> }
       {feedback.report_link  && <Anchor href={api_instance.build_download_link(feedback.report_link)} target="_blank">Click to download Report</Anchor> }
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
    const activityLog = useMap<Activity, FeedbackModel>(Array.from(props.activityLog));
    const [active, setActive] = useState(1);
    const webSocket = props.analysisSocket;
    const [webSocketReady, setWebSocketReady] = useState(webSocket.is_connected());
    webSocket.set_onmessage(function (event) {
        console.log("Message received: ", event.data)
        const feedback: FeedbackModel = JSON.parse(event.data);
        if (feedback.activity != Activity.NONE) {
            activityLog.set(feedback.activity, feedback);
            setActive(get_activity(feedback))
        }
        else {
            console.log("Unknown feedback received:", feedback)
        }

        if (feedback.activity == Activity.END) {
            webSocket.force_close();
        }
    });

    useEffect(() => {
       webSocket.set_statuschange(setWebSocketReady);
    }, [setWebSocketReady]);

    useEffect(() => {
        // TODO check https://stackoverflow.com/questions/62768520/reconnecting-web-socket-using-react-hooks
        // redo outside use effect althouth it is working now mostly
            if (webSocketReady) {
               webSocket.webSocket.send("Ready");
            }
    }, [webSocketReady]);

    return (
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
    );
}