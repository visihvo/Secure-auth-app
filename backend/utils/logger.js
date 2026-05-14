const isDev = process.env.NODE_ENV === "development";

/**
 * Logs messages to console only in development mode
 * Checks if NODE_ENV .env variable === "development"
 * 
 * Security:
 * - No information or log leaks when deployed
 * - Easier logging when it can be centralized and
 *   not having to put conditions everywhere in the
 *   code which can sometimes be forgotten
 * @param  {...any} args 
 */
function log(...args) {
    if (isDev) {
        console.log(...args);
    }
}

/**
 * Logs error messages to console only in development mode
 * Checks if NODE_ENV .env variable === "development"
 * Security:
 * - No information or error leaks when deployed
 * - Easier logging when it can be centralized and
 *   not having to put conditions everywhere in the
 *   code which can sometimes be forgotten
 * @param  {...any} args 
 */
function error(...args) {
    if (isDev) {
        console.error(...args);
    }
}

module.exports = { log, error };