import { Collection } from "discord.js";
import { message } from "../../__mocks__/message";
import { ActionRowMessageListener } from "../ActionRowMessageListener";

describe("Test BaseMessageListener with ActionRowMessage instance", () => {
    beforeEach(() => jest.clearAllMocks());
    describe("Event binding test", () => {
        test("Should bind collect event", async () => {
            const listener = new ActionRowMessageListener(message, {
                messageActionRows: [],
            });
            await listener.start();
            expect(listener.collector?.on).toBeCalledWith(
                "collect",
                expect.any(Function),
            );
        });
        test("Should bind end event", async () => {
            const listener = new ActionRowMessageListener(message, {
                messageActionRows: [],
            });
            await listener.start();
            expect(listener.collector?.on).toBeCalledWith(
                "end",
                expect.any(Function),
            );
        });
    });
    describe("Functional test", () => {
        test("Should start a listener", async () => {
            const listener = new ActionRowMessageListener(message, {
                messageActionRows: [],
            });
            expect(listener.collector).toBeUndefined();
            await listener.start();
            expect(listener.collector).toBeDefined();
        });
        test("Start a started listener should throw an error", async () => {
            const listener = new ActionRowMessageListener(message, {
                messageActionRows: [],
            });
            await listener.start();
            expect(async () => await listener.start()).rejects.toThrowError();
        });
        test("Started listener should emit a ready event", async () => {
            const listener = new ActionRowMessageListener(message, {
                messageActionRows: [],
            });
            const task = new Promise<void>((resolve) =>
                listener.once("ready", () => {
                    expect(listener.collector).toBeDefined();
                    resolve();
                }),
            );
            await Promise.all([listener.start(), task]);
        });
        test("Stop listener", async () => {
            const listener = new ActionRowMessageListener(message, {
                messageActionRows: [],
            });
            const stopReason = "foo";
            await listener.start();
            expect(listener.ended).toBe(false);
            listener.stop(stopReason);
            expect(listener.collector?.stop).toBeCalledWith(stopReason);
            expect(listener.ended).toBe(true);
        });
        test("Stop listener with default reason", async () => {
            const listener = new ActionRowMessageListener(message, {
                messageActionRows: [],
            });
            await listener.start();
            listener.stop();
            expect(listener.collector?.stop).toBeCalledWith(
                "listener was stopped",
            );
        });
        test("Handle collect end event", async () => {
            const listener = new ActionRowMessageListener(message, {
                messageActionRows: [],
            });
            const task = new Promise<void>((resolve) => {
                listener.once("end", () => {
                    expect(listener.listenerCount("end")).toBe(0);
                    resolve();
                });
            });
            // @ts-ignore
            await listener._handleCollectEnd(new Collection(), "foo");
            await task;
        });
        test("Edit message should call edit on message", async () => {
            const listener = new ActionRowMessageListener(message, {
                messageActionRows: [],
            });
            await listener.editMessage("test");
            expect(message.edit).toBeCalledWith("test");
        });
    });
});
