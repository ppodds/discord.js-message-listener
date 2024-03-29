# discord.js-message-listener

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/9adb733cddfe4b8cad2514b29b026ce4)](https://www.codacy.com/gh/ppodds/discord.js-message-listener/dashboard?utm_source=github.com&utm_medium=referral&utm_content=ppodds/discord.js-message-listener&utm_campaign=Badge_Grade)
[![codecov](https://codecov.io/gh/ppodds/discord.js-message-listener/branch/master/graph/badge.svg?token=3SGYXUG3JB)](https://codecov.io/gh/ppodds/discord.js-message-listener)
[![](https://img.shields.io/npm/dm/discord.js-message-listener)](https://www.npmjs.com/package/discord.js-message-listener)
![Issue Badge](https://img.shields.io/github/issues/ppodds/discord.js-message-listener)
![Forks Badge](https://img.shields.io/github/forks/ppodds/discord.js-message-listener)
![Stars Badge](https://img.shields.io/github/stars/ppodds/discord.js-message-listener)
![License Badge](https://img.shields.io/github/license/ppodds/discord.js-message-listener)

A simple utility to bind events on discord message.

You can use this library to listen message interaction, and react to it. For example, you can do a embed message with pagination, or a selector to choose a option.

## Features

- Listen message component interaction
  - Button
  - Select menu
- High flexibility and Extentable
  - Custom message content and component
  - Mulitple action row
- With simple utility
  - Paginator

## Installation

```shell
# if you are using discord.js v13
npm i discord.js-message-listener@^2.0.0
# v14
npm i discord.js-message-listener
```

## Example

Examples can be found in [example bot](https://github.com/ppodds/discord.js-message-listener/blob/master/example/index.ts).

## Usage

### Listener

All listener provide a same interface to operate. You can use it like this:

```typescript
// it is psudocode
const listener = new Listener(message, { collectorOptions });
listener.on("collect", (arg) => console.log("collect", arg));
listener.on("collectError", (error) => console.log(error));
listener.on("end", (collected, reason) => console.log("listenerEnd"));
await listener.start(); // it would perform some required action
```

#### ActionRowMessageListener

```typescript
import { ActionRowMessageListener } from "discord.js-message-listener";
```

ActionRowMessageListener provide a simple way to create action rows and listen to them.
To use it, you need to pass a message, and a list of action row to it. It will edit the message to show the action row and listen to it.

```typescript
const messageActionRow = new ActionRowBuilder();
const btn1 = new ButtonBuilder();
const btn2 = new ButtonBuilder();
btn1.setLabel("1");
btn2.setLabel("2");
messageActionRow.addComponents(btn1, btn2);
const listener = new ActionRowMessageListener(message, {
  messageActionRows: [messageActionRow],
  collectorOptions: {
    time: 10000,
  },
});
listener.on(
  "collect",
  // use as to cast to subclass of Interaction
  (arg) => console.log((arg as ButtonInteraction).customId)
);
await listener.start();
```

### Utility

#### Paginator

```typescript
import { Paginator } from "discord.js-message-listener";
```

Paginator provide a simple way to create paginator. It need a message listener to listen to the message. The other thing you need to do is to pass filter functions to it. Because the paginator accept any listener, you can use it flexibly.

> The paginator will bind `collect` event to the listener for you, so you don't need to do it manually.

```typescript
const messageActionRow = new ActionRowBuilder();
const prevPage = new ButtonBuilder();
const nextPage = new ButtonBuilder();
prevPage.setLabel("Prev");
prevPage.setCustomId("prev-btn");
nextPage.setLabel("Next");
nextPage.setCustomId("next-btn");
messageActionRow.addComponents(prevPage, nextPage);
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
  nextPageFilter: (arg) => (arg as ButtonInteraction).customId === "next-btn",
  previousPageFilter: (arg) =>
    (arg as ButtonInteraction).customId === "prev-btn",
});
// you should call start() to start the paginator
// start() will call listener.start() for you
await paginator.start();
```

You can also bind error handler and end handler to the paginator.

> Error handler and end handler will be bind to the listener.

```typescript
const paginator = new Paginator(listener, {
  pages,
  nextPageFilter: (arg) => (arg as ButtonInteraction).customId === "next-btn",
  previousPageFilter: (arg) =>
    (arg as ButtonInteraction).customId === "prev-btn",
  errorHandler: (error) => {
    // to something
    console.log(error);
  },
  endHandler: (collected, reason) => {
    // to something
    console.log(reason);
  },
});
```
