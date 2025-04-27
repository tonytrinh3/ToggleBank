import {
    BedrockRuntimeClient,
    ConverseCommand,
    ConverseCommandOutput,
} from "@aws-sdk/client-bedrock-runtime";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerClient, } from "@/utils/ld-server";
import { LDClient, LDSingleKindContext } from "@launchdarkly/node-server-sdk";
import { getCookie } from "cookies-next";
import { initAi, LDAIConfig, LDAIConfigTracker, LDAIClient } from "@launchdarkly/server-sdk-ai";
import { LD_CONTEXT_COOKIE_KEY } from "@/utils/constants";
import { v4 as uuidv4 } from "uuid";
import {
    ChatBotAIApiResponseInterface,
    UserChatInputResponseInterface,
    ChatBotMessageInterface,
} from "@/utils/typescriptTypesInterfaceIndustry";

export default async function chatResponse(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            throw new Error("AWS credentials are not set");
        }

        const ldClient: LDClient = await getServerClient(process.env.LD_SDK_KEY || "");
        const aiClient: LDAIClient = initAi(ldClient);
        const context: LDSingleKindContext = clientSideContext({ req, res }) || {
            kind: "user",
            key: uuidv4() 
        };

        const body: UserChatInputResponseInterface = JSON.parse(req.body);
        const aiConfigKey: string = body?.aiConfigKey;
        const userInput: string = body?.userInput;

        const aiConfig: LDAIConfig = await aiClient.config(
            aiConfigKey,
            context,
            {},
            { userInput: userInput }
        );

        AIConfigErrorHandler(aiConfig);

        const { tracker }: { tracker: LDAIConfigTracker } = aiConfig;

        const completion: ConverseCommandOutput = tracker.trackBedrockConverseMetrics(
            await bedrockClient.send(
                new ConverseCommand({
                    modelId: aiConfig?.model?.name,
                    messages: mapPromptToConversation(aiConfig.messages ?? []),
                    inferenceConfig: {
                        temperature: (aiConfig.model?.parameters?.temperature as number) ?? 0.5,
                        maxTokens: (aiConfig.model?.parameters?.maxTokens as number) ?? 200,
                    },
                })
            )
        );
        const response: string = completion.output?.message?.content?.[0]?.text ?? "no-response";
        const data: ChatBotAIApiResponseInterface = {
            response: response,
            modelName: aiConfig?.model?.name || "",
            enabled: aiConfig.enabled,
        };
        tracker.trackSuccess();
        res.status(200).json(data);
    } catch (error) {
        console.error("Error sending request to Bedrock and getting a chat response:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_DEFAULT_REGION ?? "us-west-2",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
});

const clientSideContext = ({
    res,
    req,
}: {
    res: NextApiResponse;
    req: NextApiRequest;
}): LDSingleKindContext => JSON.parse(getCookie(LD_CONTEXT_COOKIE_KEY, { res, req }) || "{}");

const mapPromptToConversation = (prompt: ChatBotMessageInterface[]) => {
    return prompt.map((item) => ({
        role: item.role !== "system" ? item.role : "user",
        content: [{ text: item.content }],
    }));
};

const AIConfigErrorHandler = (aiConfig: LDAIConfig) => {
    if (!aiConfig.enabled) {
        throw new Error("AI config is disabled");
    }

    if (!aiConfig.model) {
        throw new Error("AI model configuration is undefined");
    }

    if (!aiConfig.messages || aiConfig.messages.length === 0) {
        throw new Error("AI config messages are undefined or empty");
    }
};
