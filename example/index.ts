import {
    Client,
    Intents,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu,
} from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import { ActionRowMessageListener } from "../lib/index";
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
    if (message.content !== "!test") return;
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
    });
    listener.on("end", () => console.log("listenerEnd"));
    listener.on("collect", (arg) => console.log("collect", arg));
    listener.on("collectError", (error) => console.log(error));
});

client.login(token);
