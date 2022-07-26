import {
    ButtonInteraction,
    Message,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu,
} from "discord.js";
import { ActionRowMessageListener } from "../ActionRowMessageListener";
import { message } from "../../__mocks__/message";

describe("ActionRowMessageListener test", () => {
    beforeEach(() => jest.clearAllMocks());

    describe("Basic test", () => {
        test("Create a new ActionRowMessageListener", () => {
            const listener = new ActionRowMessageListener(message, {
                messageActionRows: [],
            });
            expect(listener).toBeInstanceOf(ActionRowMessageListener);
        });
        test("Create message component collector", async () => {
            const listener = new ActionRowMessageListener(message, {
                messageActionRows: [],
            });
            await listener.start();
            expect(message.createMessageComponentCollector).toBeCalled();
        });
        test("Start a ActionRowMessageListener with not editable message", async () => {
            const listener = new ActionRowMessageListener(
                { ...message, editable: false } as unknown as Message,
                {
                    messageActionRows: [],
                }
            );
            expect(async () => await listener.start()).rejects.toThrowError();
        });
        test("Create message component collector with arguments", async () => {
            const listener = new ActionRowMessageListener(message, {
                messageActionRows: [],
                collectorOptions: {
                    time: 10000,
                },
            });
            await listener.start();
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
        test("Create message component with custom id", () => {
            const messageActionRow = new MessageActionRow();
            const btn = new MessageButton();
            btn.customId = "test";
            messageActionRow.addComponents([btn]);
            const messageActionRows = [messageActionRow];
            const listener = new ActionRowMessageListener(message, {
                messageActionRows,
            });
            // pass by reference so we can check by the side effect of constructor
            expect(btn.customId).toBe("test");
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
    });
});
