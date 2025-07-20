// This file defines the input and output protocols for the help view in a web application.

// The input protocol defines the methods that can be called to interact with the help view,
export interface HelpInputProtocol {
    /**
     * Fetches the help content from the server
     */
    fetchHelpContent(): void;
}

//define the output protocol for the help view
export interface HelpOutputProtocol {
    /**
     * Called when the help content is successfully fetched.
     * @param content The fetched help content.
     */
    helpContentFetched(content: string): void;

    /**
     * Called when there is an error fetching the help content.
     * @param err The error that occurred while fetching help content.
     */
    helpContentError(err: Error): void;
}
