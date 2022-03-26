import {
    CacheType,
    Collection,
    Interaction,
    InteractionCollector,
    Message,
    MessageComponentCollectorOptions,
    MessageComponentInteraction,
    MessageEditOptions,
    MessagePayload,
} from "discord.js";
import { TypedEmitter } from "tiny-typed-emitter";
import { ListenerError } from "./ListenerError";

export interface ListenerEvent {
    collectError: (error: ListenerError) => void;
    collect: (args: Interaction) => void;
    ready: () => void;
    end: (collected: Collection<string, Interaction>, reason: string) => void;
}

export interface BaseMessageListenerOptions {
    collectorOptions?: MessageComponentCollectorOptions<
        MessageComponentInteraction<CacheType>
    >;
}

export abstract class BaseMessageListener extends TypedEmitter<ListenerEvent> {
    private _options: BaseMessageListenerOptions;
    private _message: Message;
    private _collector:
        | InteractionCollector<MessageComponentInteraction<CacheType>>
        | undefined;
    private _started = false;

    constructor(message: Message, options: BaseMessageListenerOptions) {
        super();
        this._options = options;
        this._message = message;
        this._collector = this.createCollector();
        this._collector?.on("collect", this.handleCollect.bind(this));
        this._collector?.on("end", this._handleCollectEnd.bind(this));
    }

    protected get message(): Message {
        return this._message;
    }

    public get options(): BaseMessageListenerOptions {
        return this._options;
    }

    /**
     * The method would be called in constructor.
     * Subclasses should override this method to create a collector.
     */
    protected abstract createCollector(): InteractionCollector<
        MessageComponentInteraction<CacheType>
    >;

    /**
     * The method that is called when the collector is started.
     * Subclasses can override this method to perform other actions when the collector is started.
     *
     * It can be used to perform actions after the collector collected a interaction.
     *
     * @param arg
     */
    protected async collect(arg: Interaction): Promise<void> {
        this.emit("collect", arg);
    }

    /**
     * Call this to handle an event as a collectable element. Accepts Interaction event data as parameters.
     * @param arg The interaction data.
     */
    public async handleCollect(arg: Interaction): Promise<void> {
        try {
            await this.collect(arg);
        } catch (error) {
            this.emit("collectError", { error, listener: this });
        }
    }

    private async _handleCollectEnd(
        collected: Collection<string, Interaction>,
        reason: string
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
        if (this._started) throw new Error("Listener has already started");
        await this.prestart();
        this._started = true;
        this.emit("ready");
    }

    public async editMessage(
        options: string | MessagePayload | MessageEditOptions
    ): Promise<Message> {
        return await this._message.edit(options);
    }
}
