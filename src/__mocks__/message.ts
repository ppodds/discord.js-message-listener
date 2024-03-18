import {
    ButtonInteraction,
    InteractionCollector,
    Message,
    SelectMenuInteraction,
} from "discord.js";

export const message = {
    createMessageComponentCollector: jest.fn().mockImplementation(() => {
        return {
            ended: false,
            on: jest.fn(),
            once: jest.fn(),
            stop: jest.fn().mockImplementation(function (
                this: InteractionCollector<
                    ButtonInteraction | SelectMenuInteraction
                >,
            ) {
                this.ended = true;
            }),
        } as unknown as InteractionCollector<
            ButtonInteraction | SelectMenuInteraction
        >;
    }),
    edit: jest.fn().mockImplementation(() => Promise.resolve()),
    editable: true,
    components: [],
} as unknown as Message;
