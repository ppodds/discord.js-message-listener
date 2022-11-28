import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    Client,
    EmbedBuilder,
    IntentsBitField,
    Partials,
    SelectMenuBuilder,
    SelectMenuOptionBuilder,
} from "discord.js";
import { ActionRowMessageListener, Paginator } from "../lib/index";
import { token } from "./env";

const client = new Client({
    // IMPORTANT: you should set it or your bot can't get the information of Discord
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildEmojisAndStickers,
        IntentsBitField.Flags.GuildIntegrations,
        IntentsBitField.Flags.GuildWebhooks,
        IntentsBitField.Flags.GuildInvites,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildMessageTyping,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.DirectMessageReactions,
        IntentsBitField.Flags.DirectMessageTyping,
        IntentsBitField.Flags.MessageContent,
    ],
    // if you CHANNEL not enable, you can't get any event in dm channel
    partials: [Partials.Channel],
});

client.on("ready", () => {
    if (client.user) {
        console.log(`${client.user.tag} has logged in.`);
    }
});

client.on("messageCreate", async (message) => {
    if (message.content === "!test") {
        const msg = await message.channel.send("test");
        const messageActionRow1 = new ActionRowBuilder();
        const btn1 = new ButtonBuilder();
        const btn2 = new ButtonBuilder();
        const btn3 = new ButtonBuilder();
        btn1.setLabel("1");
        btn2.setLabel("2");
        btn2.setURL("https://www.google.com");
        btn3.setLabel("3");
        btn3.setStyle(ButtonStyle.Success);
        const messageActionRow2 = new ActionRowBuilder();
        const selectMenu = new SelectMenuBuilder();
        const option1 = new SelectMenuOptionBuilder();
        const option2 = new SelectMenuOptionBuilder();
        option1.setLabel("a").setValue("a");
        option2.setLabel("b").setValue("b");
        selectMenu.addOptions(option1, option2);
        messageActionRow1.addComponents(btn1, btn2, btn3);
        messageActionRow2.addComponents(selectMenu);
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
        const messageActionRow = new ActionRowBuilder();
        const prevPage = new ButtonBuilder();
        const nextPage = new ButtonBuilder();
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
        const page1 = new EmbedBuilder();
        const page2 = new EmbedBuilder();
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
