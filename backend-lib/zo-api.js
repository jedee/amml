const API_URL = "https://api.zo.computer/zo/ask";
const REQUEST_TIMEOUT = 60000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
export async function callZo(input, options) {
    const token = options?.token ?? process.env.ZO_CLIENT_IDENTITY_TOKEN;
    if (!token) {
        throw new Error("ZO_CLIENT_IDENTITY_TOKEN is required");
    }
    const data = { input };
    if (options?.outputFormat) {
        data.output_format = options.outputFormat;
    }
    if (options?.conversationId) {
        data.conversation_id = options.conversationId;
    }
    let lastError = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    authorization: token,
                    "content-type": "application/json",
                },
                body: JSON.stringify(data),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (response.ok) {
                return (await response.json());
            }
            const errorText = await response.text();
            lastError = new Error(`HTTP ${response.status}: ${errorText}`);
            console.error(`Warning: Status ${response.status} on attempt ${attempt + 1}/${MAX_RETRIES}`);
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            console.error(`Warning: Request failed on attempt ${attempt + 1}/${MAX_RETRIES}:`, error);
        }
        if (attempt < MAX_RETRIES - 1) {
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        }
    }
    throw new Error(`All ${MAX_RETRIES} retry attempts failed. Last error: ${lastError?.message}`);
}
