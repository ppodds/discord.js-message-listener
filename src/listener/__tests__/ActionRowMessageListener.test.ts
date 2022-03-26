import {
    ButtonInteraction,
    CacheType,
    InteractionCollector,
    Message,
    MessageActionRow,
    MessageButton,
    MessageComponentInteraction,
    MessageSelectMenu,
} from "discord.js";
import { ActionRowMessageListener } from "../ActionRowMessageListener";

describe("ActionRowMessageListener test", () => {
    const message = {
        createMessageComponentCollector: jest.fn().mockImplementation(() => {
            return {
                ended: false,
                on: jest.fn(),
                once: jest.fn(),
                stop: jest.fn(),
            } as unknown as InteractionCollector<
                MessageComponentInteraction<CacheType>
            >;
        }),
        edit: jest.fn().mockImplementation(() => Promise.resolve()),
        editable: true,
        components: [],
    } as unknown as Message;

    beforeEach(() => jest.clearAllMocks());

    describe("Basic test", () => {
        test("Create a new ActionRowMessageListener", () => {
            const listener = new ActionRowMessageListener(message, {
                messageActionRows: [],
            });
            expect(listener).toBeInstanceOf(ActionRowMessageListener);
        });
        test("Create message component collector", () => {
            const listener = new ActionRowMessageListener(message, {
                messageActionRows: [],
            });
            expect(message.createMessageComponentCollector).toBeCalled();
        });
        test("Create message component collector with arguments", () => {
            const listener = new ActionRowMessageListener(message, {
                messageActionRows: [],
                collectorOptions: {
                    time: 10000,
                },
            });
            expect(message.createMessageComponentCollector).toBeCalledWith({
                time: 10000,
            });
        });
        test("Edit message to create message component", async () => {
            const messageActionRow1 = new MessageActionRow();
            const messageActionRow2 = new MessageActionRow();
            const btn1 = new MessageButton();
            const btn2 = new MessageButton();
            btn2.setURL("https://www.google.com");
            const selectMenu = new MessageSelectMenu();
            const option1 = { label: "a", value: "a" };
            const option2 = { label: "b", value: "b" };
            selectMenu.addOptions(option1);
            selectMenu.addOptions(option2);
            messageActionRow1.addComponents([btn1, btn2]);
            messageActionRow2.addComponents([selectMenu]);
            const messageActionRows = [messageActionRow1, messageActionRow2];
            const listener = new ActionRowMessageListener(message, {
                messageActionRows,
            });
            const task = new Promise<void>((resolve) =>
                listener.once("ready", () => {
                    expect(message.edit).toBeCalledWith({
                        components: messageActionRows,
                    });
                    resolve();
                })
            );
            await Promise.all([listener.start(), task]);
        });
    });
    describe("Event binding test", () => {
        test("Should bind collect event", async () => {
            const listener = new ActionRowMessageListener(message, {
                messageActionRows: [],
            });
            expect(listener.collector?.on).toBeCalledWith(
                "collect",
                expect.any(Function)
            );
        });
        test("Should bind end event", async () => {
            const listener = new ActionRowMessageListener(message, {
                messageActionRows: [],
            });
            expect(listener.collector?.on).toBeCalledWith(
                "end",
                expect.any(Function)
            );
        });
    });
    describe("Functional test", () => {
        test("Handle collect", async () => {
            const messageActionRow = new MessageActionRow();
            const btn = new MessageButton();
            messageActionRow.addComponents([btn]);
            const messageActionRows = [messageActionRow];
            const listener = new ActionRowMessageListener(message, {
                messageActionRows,
            });

            const interaction = { id: "9487" } as ButtonInteraction;
            const task = new Promise<void>((resolve) => {
                listener.on("collect", (arg) => {
                    expect(arg).toBe(interaction);
                    resolve();
                });
            });
            await Promise.all([listener.handleCollect(interaction), task]);
        });
        test("Stop listener", async () => {
            const listener = new ActionRowMessageListener(message, {
                messageActionRows: [],
            });
            const stopReason = "foo";
            await listener.start();
            listener.stop(stopReason);
            expect(listener.collector?.stop).toBeCalledWith(stopReason);
        });
    });
});
