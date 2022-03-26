import { BaseMessageListener } from "./BaseMessageListener";

export interface ListenerError {
    error: unknown;
    listener: BaseMessageListener;
}
