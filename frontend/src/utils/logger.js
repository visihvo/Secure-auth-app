/**
 * Helper module for development mode console printing
 * and error logging
 */

const isDev = import.meta.env.MODE === "development";

export const log = (...args) => {
    if (isDev) {
        console.log(...args);
    }
};

export const error = (...args) => {
    if (isDev) {
        console.error(...args);
    }
};