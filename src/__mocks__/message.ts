import {
    CacheType,
    InteractionCollector,
    Message,
    MessageComponentInteraction,
} from "discord.js";

export const message = {
    createMessageComponentCollector: jest.fn().mockImplementation(() => {
        return {
            ended: false,
            on: jest.fn(),
            once: jest.fn(),
            stop: jest
                .fn()
                .mockImplementation(function (
                    this: InteractionCollector<
                        MessageComponentInteraction<CacheType>
                    >
                ) {
                    this.ended = true;
                }),
        } as unknown as InteractionCollector<
            MessageComponentInteraction<CacheType>
        >;
    }),
    edit: jest.fn().mockImplementation(() => Promise.resolve()),
    editable: true,
    components: [],
} as unknown as Message;
