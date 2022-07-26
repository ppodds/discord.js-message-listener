import { Collection, MessageEmbed } from "discord.js";
import { BaseMessageListener } from "../listener/BaseMessageListener";
import { ListenerError } from "../listener/ListenerError";

export interface PaginatorOptions<K, V, F extends unknown[]> {
    pages: MessageEmbed[];
    nextPageFilter: (arg0: V, ...arg1: F) => boolean;
    previousPageFilter: (arg0: V, ...arg1: F) => boolean;
    errorHandler?: (error: ListenerError<K, V, F>) => void;
    endHandler?: (collected: Collection<K, V>, reason: string) => void;
}

export class Paginator<K, V, F extends unknown[] = []> {
    private _options: PaginatorOptions<K, V, F>;
    private _listener: BaseMessageListener<K, V, F>;
    private _currentPage = 0;
    constructor(
        listener: BaseMessageListener<K, V, F>,
        options: PaginatorOptions<K, V, F>
    ) {
        if (options.pages.length === 0)
            throw new Error("Paginator must have at least one page.");
        this._options = options;
        this._listener = listener;
        this._listener.on("collect", async (arg0, ...arg1) => {
            if (this._options.nextPageFilter(arg0, ...arg1))
                await this.nextPage();
            else if (this._options.previousPageFilter(arg0, ...arg1))
                await this.previousPage();
        });
        if (this._options.errorHandler)
            this._listener.on("collectError", this._options.errorHandler);
        if (this._options.endHandler)
            this._listener.on("end", this._options.endHandler);
    }
    public get currentPage(): number {
        return this._currentPage;
    }
    public async nextPage(): Promise<void> {
        this._currentPage++;
        this._currentPage = this._currentPage % this._options.pages.length;
        await this._listener.editMessage({
            embeds: [this._options.pages[this._currentPage]],
        });
    }
    public async previousPage(): Promise<void> {
        this._currentPage--;
        this._currentPage =
            this._currentPage < 0
                ? this._options.pages.length - 1
                : this._currentPage;
        await this._listener.editMessage({
            embeds: [this._options.pages[this._currentPage]],
        });
    }
    public async start(): Promise<void> {
        await Promise.all([
            this._listener.editMessage({
                embeds: [this._options.pages[this._currentPage]],
            }),
            this._listener.start(),
        ]);
    }
}
