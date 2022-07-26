import { BaseMessageListener } from "./BaseMessageListener";

export interface ListenerError<K, V, F extends unknown[]> {
    error: unknown;
    listener: BaseMessageListener<K, V, F>;
}
