export type WealthManagementGraphDataType = {
	month: string;
	balance: number;
};

export interface TransactionInterface {
	id: number;
	date: string;
	merchant: string;
	status: string;
	amount: number;
	accounttype: string;
	user: string;
}

export interface AIModelInterface {
	messages: [
		{
			content: string;
			role: "system" | "user";
		}
	];
	model: {
		parameters: { temperature: number; maxTokens: number };
		name: string;
	};
	_ldMeta: {
		enabled: boolean;
		variationKey?: string;
		version?: number;
		versionKey?: string;
	};
}

type AIChatBotConversationRole = "assistant" | "user" | "system";
export interface ChatBotMessageInterface {
	id?: string;
	role: AIChatBotConversationRole;
	content: string;
}
export interface ChatBotAIApiResponseInterface {
	error?: string;
	response: string;
	enabled: boolean;
	modelName: string;
}

export interface UserChatInputResponseInterface {
	aiConfigKey: string;
	userInput: string;
}

export interface UserAIChatBotFeedbackResponseInterface {
	aiConfigKey: string;
	feedback: string;
}

export interface StockDataInterface {
	time: string;
	value: number;
	direction: "up" | "down" | null;
}

export interface StockInterface {
	ticker: string;
	name: string;
	data: StockDataInterface[];
	image: string;
}

export interface WealthManagementSheetInterface {
	data: any;
	aiPrompt: string;
	submitQuery: (prompt: string) => void;
	prompt: string;
	loading: boolean;
	aiResponse: string;
}

export type UserDataType = {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	dob: string;
	ssn: string;
	phone: string;
	address: string;
	apt: string;
	zip: string;
	selectedServices: string[];
};
