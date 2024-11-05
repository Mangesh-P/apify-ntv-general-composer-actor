import { Actor, log } from 'apify';

const { ACTOR_DEFAULT_KEY_VALUE_STORE_ID } = process.env;

export async function saveError(error: any, key = 'ERROR') {
    const { message, stack, trace, status, statusText } = error;
    log.error(message);
    if (stack) {
        log.error(stack);
    }
    if (trace) {
        log.error(trace);
    }
    if (status) {
        log.error(status);
    }
    if (statusText) {
        log.error(statusText);
    }
    log.info(
        `https://api.apify.com/v2/key-value-stores/${ACTOR_DEFAULT_KEY_VALUE_STORE_ID}/records/ERROR?disableRedirect=true`,
    );
    return await Actor.setValue(key, {
        message,
        trace,
        status,
        statusText,
    });
}
