import {
    ButtonInteraction,
    Message,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu,
} from "discord.js";
import { ActionRowMessageListener } from "../ActionRowMessageListener";

describe("ActionRowMessageListener test", () => {
    const message = {
        createMessageComponentCollector: jest.fn(),
        edit: jest.fn().mockImplementation(() => Promise.resolve()),
        editable: true,
        components: [],
    } as unknown as Message;

    beforeEach(() => jest.clearAllMocks());

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
        await new Promise<void>((resolve) => listener.once("ready", resolve));
        expect(message.edit).toBeCalledWith({
            components: messageActionRows,
        });
    });
    test("Handle collect", async () => {
        const messageActionRow = new MessageActionRow();
        const btn = new MessageButton();
        messageActionRow.addComponents([btn]);
        const messageActionRows = [messageActionRow];
        const listener = new ActionRowMessageListener(message, {
            messageActionRows,
        });

        const interaction = { id: "9487" } as ButtonInteraction;

        listener.on("collect", (arg) => {
            expect(arg).toBe(interaction);
        });

        await listener.handleCollect(interaction);
    });
});
