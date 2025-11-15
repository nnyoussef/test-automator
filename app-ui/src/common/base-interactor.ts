import { useTestLogsState } from '@/service/state-store/test-log-store.ts';
import { useGpState } from '@/service/state-store/gp-store';

import { UnsupportedOperationError } from '@/common/exceptions';
import { type AppEnv, env } from '@/environment';
import type { Optional, ReadonlyKeyValueMap } from '@/common/types.ts';

export const noop = new Proxy({} as ReadonlyKeyValueMap<Function>, {
    get: () => () => {
        throw new UnsupportedOperationError('Method invoked from noop');
    },
});

/**
 * BaseInteractor is an abstract class that serves as a foundation for creating interactors.
 * It provides methods to manage entities, output protocols, and application configurations.
 * Subclasses must implement the getComponentName method to provide a unique identifier.
 *
 * @template OutputProtocol - The type of the output protocol.
 * @template ENTITY - The type of the entity associated with the interactor.
 */
export abstract class BaseInteractor<OutputProtocol, ENTITY> {
    protected constructor() {}

    private _entity: Optional<ENTITY> = null;
    private _outputProtocol: Readonly<OutputProtocol> = noop as OutputProtocol;

    private readonly _abortController = new AbortController();
    private readonly _appEnv: AppEnv = env;

    /**
     * Gets the entity associated with the interactor.
     * @throws UnsupportedOperationError if the entity is not set.
     */
    get entity(): ENTITY {
        if (!this._entity) {
            throw new UnsupportedOperationError('Entity not found');
        }
        return this._entity;
    }

    /**
     * Sets the entity for the interactor.
     * @param entity - The entity to set, or null to clear it.
     */
    set entity(entity: Optional<ENTITY>) {
        this._entity = entity;
    }

    /**
     * Gets the output protocol associated with the interactor.
     * @throws UnsupportedOperationError if the output protocol is not set.
     */
    get outputProtocol(): Readonly<OutputProtocol> {
        return this._outputProtocol;
    }

    /**
     * Sets the output protocol for the interactor.
     * @param outputProtocol - The output protocol to set, or noop if not provided.
     */
    set outputProtocol(outputProtocol: OutputProtocol) {
        if (outputProtocol) {
            this._outputProtocol = outputProtocol;
            return;
        }
        this._outputProtocol = noop as OutputProtocol;
    }

    /**
     * Gets the AbortController associated with the interactor.
     * This controller can be used to abort ongoing operations.
     * @returns The AbortController instance.
     */
    get abortController(): AbortController {
        return this._abortController;
    }

    /**
     * Gets the AbortSignal associated with the interactor's AbortController.
     * This signal can be used to listen for abort events.
     * @returns The AbortSignal instance.
     */
    get abortSignal(): AbortSignal {
        return this.abortController.signal;
    }

    /**
     * Destroys the interactor by aborting any ongoing operations.
     */
    public destroy(): void {
        this.abortController.abort();
    }

    /**
     * Gets the test logs global state.
     * @returns The global test logs state.
     */
    protected getTestLogsState() {
        return useTestLogsState();
    }

    /**
     * Gets the name of the component associated with this interactor.
     * This method must be implemented by subclasses to provide a unique identifier.
     * @returns The name of the component.
     */
    protected abstract getComponentName(): string;

    /**
     * Saves data to the global general purpose state store under a specific key.
     * @param key - The key under which to save the data.
     * @param data - The data to save.
     */
    protected saveToGpStateStore(key: string, data: unknown): void {
        useGpState().putByKey(this.getComponentName(), key, data);
    }

    /**
     * Retrieves data from the global general purpose state store by key.
     * If the key does not exist, returns the provided default data.
     * @param key - The key to retrieve data for.
     * @param defaultData - The default data to return if the key does not exist.
     * @returns The retrieved data or the default data if not found.
     */
    protected getFromGpStateStore<T>(key: string, defaultData: T): T {
        return useGpState().getByKeys(this.getComponentName(), key, defaultData);
    }

    /**
     * Retrieves the application configurations.
     * @returns The application configurations.
     */
    protected getAppEnv(): AppEnv {
        return this._appEnv;
    }
}
