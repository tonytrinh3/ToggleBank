import { useLDClient } from "launchdarkly-react-client-sdk";
import { createContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { setCookie } from "cookies-next";
import { LD_CONTEXT_COOKIE_KEY, STARTER_PERSONAS } from "../constants";
import { Persona } from "../typescriptTypesInterfaceLogin";
import type {
    LoginContextProviderInterface,
    LDContextInterface,
} from "@/utils/typescriptTypesInterfaceLogin";
import {
    getDeviceForContext,
    getLocation,
    getExistingAudienceKey,
    getRandomizedDeviceForContext,
    getRandomizedUserTier,
    getRandomizedUserRole,
    getRandomizedLocation,
    getRandomizedUser
} from "../utils";
import { MultiKindLDContext } from "../MultiKindLDContext";

const startingUserObject: Persona = {
    personaname: "",
    personatier: "",
    personaimage: "",
    personaemail: "",
    personarole: "",
};

const LoginContext = createContext<LoginContextProviderInterface>({
    userObject: startingUserObject,
    isLoggedIn: false,
    async updateAudienceContext() {},
    async updateRandomizedUserContext() {},
    async loginUser() {},
    async logoutUser() {},
    allUsers: [],
    appMultiContext: {},
});

export default LoginContext;

export const LoginProvider = ({ children }: { children: any }) => {
    const ldClient = useLDClient();
    const starterLDContext: LDContextInterface = MultiKindLDContext({ isAnonymous: true });
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [userObject, setUserObject] = useState<Persona>(startingUserObject);
    const [appMultiContext, setAppMultiContext] = useState<LDContextInterface>(starterLDContext);
    const [allUsers, setAllUsers] = useState<Persona[]>(STARTER_PERSONAS);

    /**
     * Helper function to safely call LaunchDarkly identify with error handling.
     * 
     * WHY THIS WORKS:
     * 
     * The Problem (Before):
     * - Original code: `await ldClient?.identify(newContext)`
     * - When LaunchDarkly throws a 401 error, it propagates up and blocks the login flow
     * - Optional chaining (`?.`) only guards against null/undefined, not thrown errors
     * 
     * The Solution:
     * - Early return: If ldClient doesn't exist, skip the call entirely
     * - Try-catch: Intercepts any errors (like 401) from ldClient.identify()
     * - Error swallowing: By catching and NOT rethrowing, the error doesn't propagate
     * - Function resolves successfully: The caller continues normally even if LaunchDarkly fails
     * 
     * Flow Comparison:
     * Before: loginUser() → await ldClient.identify() → ❌ 401 Error → ❌ Login stops
     * After:  loginUser() → await safeLDIdentify() → catch error → ✅ Login continues
     * 
     * This allows users to login even when LaunchDarkly SDK is unavailable, misconfigured,
     * or returns authentication errors (401). The app gracefully degrades without blocking.
     */
    const safeLDIdentify = async (context: LDContextInterface): Promise<void> => {
        // Early return if LaunchDarkly client is not initialized
        if (!ldClient) {
            console.warn("LaunchDarkly client not available, skipping identify");
            return;
        }

        // Wrap LaunchDarkly call in try-catch to prevent errors from blocking the app
        // If identify() throws (e.g., 401 authentication error), we catch it here
        // and allow the calling function to continue normally
        try {
            await ldClient.identify(context);
        } catch (error) {
            // Log error for debugging but don't throw - allow app to continue without LaunchDarkly
            // By not rethrowing, the promise resolves successfully and the caller continues
            console.warn("LaunchDarkly identify failed, continuing without it:", error);
        }
    };

    const loginUser = async (email: string): Promise<void> => {
        updateAllUsersArray({ userObject, setAllUsers });

        const chosenPersona = getChosenPersona({ allUsers: allUsers, chosenEmail: email });

        await setUserObject(chosenPersona);

        const newContext = MultiKindLDContext({
            audienceKey: getExistingAudienceKey(),
            userEmail: chosenPersona.personaemail,
            userName: chosenPersona.personaname,
            isAnonymous: false,
            userKey: uuidv4().slice(0, 10),
            userRole: chosenPersona.personarole,
            userTier: chosenPersona?.personatier,
            newDevice: getDeviceForContext(),
            newLocation: getLocation(),
        });

        setAppMultiContext(newContext);
        //await ldClient?.identify(newContext);
        setCookie(LD_CONTEXT_COOKIE_KEY, newContext);
        
        // Attempt LaunchDarkly identify, but don't block login if it fails
        await safeLDIdentify(newContext);
        
        setIsLoggedIn(true);
    };

    const updateAudienceContext = async (): Promise<void> => {
        const existingContext = appMultiContext;

        const newContext = MultiKindLDContext({
            audienceKey: uuidv4().slice(0, 10),
            userEmail: existingContext.user.email,
            userName: existingContext.user.name,
            isAnonymous: existingContext.user.anonymous,
            userKey: existingContext.user.key,
            userRole: existingContext.user.role,
            userTier: existingContext.user.tier,
            newDevice: existingContext.device,
            newLocation: existingContext.location,
        });

        setAppMultiContext(newContext);
        setCookie(LD_CONTEXT_COOKIE_KEY, newContext);
        
        // Attempt LaunchDarkly identify, but don't block if it fails
        await safeLDIdentify(newContext);
    };

    const updateRandomizedUserContext = async (): Promise<void> => {
        const randomizedUser = getRandomizedUser();
        const newContext = MultiKindLDContext({
            audienceKey: uuidv4().slice(0, 10),
            userEmail: randomizedUser.email,
            userName: randomizedUser.name,
            isAnonymous: false,
            userKey: uuidv4().slice(0, 10),
            userRole: getRandomizedUserRole(),
            userTier: getRandomizedUserTier(),
            newDevice: getRandomizedDeviceForContext(),
            newLocation: getRandomizedLocation(),
        });
        
        // Attempt LaunchDarkly identify, but don't block if it fails
        await safeLDIdentify(newContext);
    };

    const logoutUser = async () => {
        setIsLoggedIn(false);
        setUserObject(startingUserObject);
        setAllUsers(STARTER_PERSONAS);
        const newContext = MultiKindLDContext({
            audienceKey: getExistingAudienceKey(),
            isAnonymous: true,
        });
        setAppMultiContext(newContext);
        //await ldClient?.identify(newContext);
        setCookie(LD_CONTEXT_COOKIE_KEY, newContext);
        
        // Attempt LaunchDarkly identify, but don't block logout if it fails
        await safeLDIdentify(newContext);
    };

    return (
        <LoginContext.Provider
            value={{
                userObject,
                isLoggedIn,
                updateAudienceContext,
                updateRandomizedUserContext,
                loginUser,
                logoutUser,
                allUsers,
                appMultiContext,
            }}
        >
            {children}
        </LoginContext.Provider>
    );
};

const getAllUsersLeft = ({ users, userObject }: { users: Persona[]; userObject: Persona }) => {
    return users.filter((persona: Persona) => persona.personaemail !== userObject.personaemail);
};

const updateAllUsersArray = ({userObject,setAllUsers}:{userObject: Persona; setAllUsers: React.Dispatch<React.SetStateAction<Persona[]>>})=>{
    if (userObject.personaemail !== "") {
        setAllUsers((prevObj) => [
            ...getAllUsersLeft({ users: prevObj, userObject: userObject }),
            userObject as Persona,
        ]);
    }
};

const getChosenPersona = ({
    allUsers,
    chosenEmail,
}: {
    allUsers: Persona[];
    chosenEmail: string;
}): Persona => {
    return (
        allUsers.find((persona) => persona.personaemail.includes(chosenEmail)) ||
        STARTER_PERSONAS[0]
    );
};
