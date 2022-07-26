import {
    ButtonInteraction,
    Client,
    Intents,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    MessageSelectMenu,
} from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import { ActionRowMessageListener, Paginator } from "../lib/index";
import { token } from "./env";

const client = new Client({
    // IMPORTANT: you should set it or your bot can't get the information of Discord
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_INTEGRATIONS,
        Intents.FLAGS.GUILD_WEBHOOKS,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING,
    ],
    // if you CHANNEL not enable, you can't get any event in dm channel
    partials: ["CHANNEL"],
});

client.on("ready", () => {
    if (client.user) {
        console.log(`${client.user.tag} has logged in.`);
    }
});

client.on("messageCreate", async (message) => {
    if (message.content === "!test") {
        const msg = await message.channel.send("test");
        const messageActionRow1 = new MessageActionRow();
        const btn1 = new MessageButton();
        const btn2 = new MessageButton();
        const btn3 = new MessageButton();
        btn1.setLabel("1");
        btn2.setLabel("2");
        btn2.setURL("https://www.google.com");
        btn3.setLabel("3");
        btn3.setStyle(MessageButtonStyles.SUCCESS);
        const messageActionRow2 = new MessageActionRow();
        const selectMenu = new MessageSelectMenu();
        selectMenu.addOptions({ label: "a", value: "a" });
        selectMenu.addOptions({ label: "b", value: "b" });
        messageActionRow1.addComponents([btn1, btn2, btn3]);
        messageActionRow2.addComponents([selectMenu]);
        const listener = new ActionRowMessageListener(msg, {
            messageActionRows: [messageActionRow1, messageActionRow2],
            collectorOptions: {
                time: 10000,
            },
        });
        listener.on("end", () => console.log("listenerEnd"));
        listener.on("collect", (arg) => console.log("collect", arg));
        listener.on("collectError", (error) => console.log(error));
        await listener.start();
    } else if (message.content === "!paginator") {
        const msg = await message.channel.send("paginator");
        const messageActionRow = new MessageActionRow();
        const prevPage = new MessageButton();
        const nextPage = new MessageButton();
        prevPage.setLabel("Prev");
        prevPage.setCustomId("prev-btn");
        nextPage.setLabel("Next");
        nextPage.setCustomId("next-btn");
        messageActionRow.addComponents([prevPage, nextPage]);
        const listener = new ActionRowMessageListener(msg, {
            messageActionRows: [messageActionRow],
            collectorOptions: {
                time: 60000,
            },
        });
        const page1 = new MessageEmbed();
        const page2 = new MessageEmbed();
        page1.setTitle("Page 1");
        page2.setTitle("Page 2");
        const pages = [page1, page2];
        const paginator = new Paginator(listener, {
            pages,
            nextPageFilter: (arg) =>
                (arg as ButtonInteraction).customId === "next-btn",
            previousPageFilter: (arg) =>
                (arg as ButtonInteraction).customId === "prev-btn",
        });
        await paginator.start();
    }
});

client.login(token);
