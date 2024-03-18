import {
    Collection,
    Collector,
    CollectorOptions,
    Message,
    MessageEditOptions,
    MessagePayload,
} from "discord.js";
import { TypedEmitter } from "tiny-typed-emitter";
import { ListenerError } from "./ListenerError";

export interface ListenerEvent<K, V, F extends unknown[]> {
    collectError: (error: ListenerError<K, V, F>) => void;
    collect: (arg0: V, ...arg1: F) => void;
    ready: () => void;
    end: (collected: Collection<K, V>, reason: string) => void;
}

export interface BaseMessageListenerOptions<T extends unknown[]> {
    collectorOptions?: CollectorOptions<T>;
}

export abstract class BaseMessageListener<
    K,
    V,
    F extends unknown[] = [],
> extends TypedEmitter<ListenerEvent<K, V, F>> {
    private _options: BaseMessageListenerOptions<[V, ...F]>;
    private _message: Message;
    private _collector?: Collector<K, V, F>;

    constructor(
        message: Message,
        options: BaseMessageListenerOptions<[V, ...F]>,
    ) {
        super();
        this._options = options;
        this._message = message;
    }

    protected get message(): Message {
        return this._message;
    }

    public get options(): BaseMessageListenerOptions<[V, ...F]> {
        return this._options;
    }

    /**
     * The method would be called in constructor.
     * Subclasses should override this method to create a collector.
     */
    protected abstract createCollector(): Collector<K, V, F>;

    /**
     * The method that is called when the collector is started.
     * Subclasses can override this method to perform other actions when the collector is started.
     *
     * It can be used to perform actions after the collector collected a interaction.
     *
     * @param arg0 data which was collected
     * @param arg1
     */
    protected async collect(arg0: V, ...arg1: F): Promise<void> {
        this.emit("collect", arg0, ...arg1);
    }

    /**
     * Call this to handle an event as a collectable element. Accepts event data as parameters.
     * @param arg0 data which was collected
     * @param arg1
     */
    public async handleCollect(arg0: V, ...arg1: F): Promise<void> {
        try {
            await this.collect(arg0, ...arg1);
        } catch (error) {
            this.emit("collectError", { error, listener: this });
        }
    }

    private async _handleCollectEnd(
        collected: Collection<K, V>,
        reason: string,
    ): Promise<void> {
        this.emit("end", collected, reason);
        this.removeAllListeners();
    }

    /**
     * Task to be performed before the listener is ready.
     * Subclasses should override this method to start the collector.
     */
    protected abstract prestart(): Promise<void>;

    /**
     * Start the listener.
     * It would perform prestart() and then start the collector.
     */
    public async start(): Promise<void> {
        if (this._collector) throw new Error("Listener has already started");
        await this.prestart();
        this._collector = this.createCollector();
        /* eslint-disable */
        // @ts-ignore
        this._collector.on("collect", this.handleCollect.bind(this));
        // @ts-ignore
        this._collector.on("end", this._handleCollectEnd.bind(this));
        /* eslint-enable */
        this.emit("ready");
    }

    public async editMessage(
        options: string | MessagePayload | MessageEditOptions,
    ): Promise<Message> {
        return await this._message.edit(options);
    }

    public stop(reason = "listener was stopped"): void {
        if (!this._collector) throw new Error("Listener has not started");
        if (!this._collector.ended) this._collector.stop(reason);
        this.removeAllListeners();
    }

    public get collector(): Collector<K, V, F> | undefined {
        return this._collector;
    }

    public get ended(): boolean {
        return this._collector?.ended ?? false;
    }
}
