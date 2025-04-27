import { NextApiRequest, NextApiResponse } from "next";
import { getServerClient } from "@/utils/ld-server";
import { LD_CONTEXT_COOKIE_KEY } from "@/utils/constants";
import { getCookie } from "cookies-next";
import {
    initAi,
    LDAIConfig,
    LDAIClient,
    LDAIConfigTracker,
    LDFeedbackKind,
} from "@launchdarkly/server-sdk-ai";
import { LDClient, LDSingleKindContext } from "@launchdarkly/node-server-sdk";
import { v4 as uuidv4 } from "uuid";
import { UserAIChatBotFeedbackResponseInterface } from "@/utils/typescriptTypesInterfaceIndustry";
import { AI_CHATBOT_BAD_SERVICE,AI_CHATBOT_GOOD_SERVICE } from "@/components/generators/experimentation-automation/experimentationConstants";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const extractedClientSideAudienceKey =
            clientSideContext({ req, res })?.audience?.key || uuidv4().slice(0, 6);
        const clientSideAudienceContext = {
            kind: "audience",
            key: extractedClientSideAudienceKey,
        };
        const ldClient: LDClient = await getServerClient(process.env.LD_SDK_KEY || "");
        const aiClient: LDAIClient = initAi(ldClient);
        const body: UserAIChatBotFeedbackResponseInterface = JSON.parse(req.body);
        const feedback: string = body?.feedback;
        const aiConfigKey: string = body?.aiConfigKey;
        const aiConfig: LDAIConfig = await aiClient.config(
            aiConfigKey,
            clientSideAudienceContext,
            {},
            {}
        );
        const { tracker }: { tracker: LDAIConfigTracker } = aiConfig;

        if (feedback === AI_CHATBOT_BAD_SERVICE) {
            await tracker.trackFeedback({ kind: LDFeedbackKind.Negative });
        }
        if (feedback === AI_CHATBOT_GOOD_SERVICE) {
            await tracker.trackFeedback({ kind: LDFeedbackKind.Positive });
        }

        res.status(200).json({ message: "Feedback received and processed" });
    } catch (error) {
        console.error("Error in chatbotFeedback", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const clientSideContext = ({
    res,
    req,
}: {
    res: NextApiResponse;
    req: NextApiRequest;
}): LDSingleKindContext => JSON.parse(getCookie(LD_CONTEXT_COOKIE_KEY, { res, req }) || "{}");
