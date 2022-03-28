import { Interaction, MessageEmbed } from "discord.js";
import { Paginator } from "../Paginator";
import { BaseMessageListener } from "../../listener/BaseMessageListener";

describe("Paginator test", () => {
    const listener = {
        on: jest.fn(),
        editMessage: jest.fn().mockImplementation(() => Promise.resolve()),
        handleCollect: jest.fn().mockImplementation(() => Promise.resolve()),
        start: jest.fn().mockImplementation(() => Promise.resolve()),
    } as unknown as BaseMessageListener;
    const page1 = new MessageEmbed();
    const page2 = new MessageEmbed();
    page1.setTitle("Page 1");
    page2.setTitle("Page 2");
    const pages = [page1, page2];

    beforeEach(() => jest.clearAllMocks());

    describe("Basic test", () => {
        test("Create a new Paginator", () => {
            const paginator = new Paginator(listener, {
                pages,
                nextPageFilter: () => true,
                previousPageFilter: () => true,
            });
            expect(paginator).toBeInstanceOf(Paginator);
        });
        test("Paginator must has at least one page", () => {
            expect(
                () =>
                    new Paginator(listener as BaseMessageListener, {
                        pages: [],
                        nextPageFilter: () => true,
                        previousPageFilter: () => true,
                    })
            ).toThrowError();
        });
        test("Start paginator", async () => {
            const paginator = new Paginator(listener, {
                pages,
                nextPageFilter: () => true,
                previousPageFilter: () => true,
            });
            await paginator.start();
            expect(listener.start).toHaveBeenCalledTimes(1);
            expect(listener.editMessage).toHaveBeenCalledTimes(1);
        });
    });
    describe("Event binding test", () => {
        test("Should bind collect event on collector", () => {
            const paginator = new Paginator(listener, {
                pages,
                nextPageFilter: () => true,
                previousPageFilter: () => true,
            });
            expect(listener.on).toBeCalledWith("collect", expect.any(Function));
        });
        test("Should bind collectError event on collector", () => {
            const paginator = new Paginator(listener, {
                pages,
                nextPageFilter: () => true,
                previousPageFilter: () => true,
                errorHandler: () => true,
            });
            expect(listener.on).toBeCalledWith(
                "collectError",
                expect.any(Function)
            );
        });
        test("Should bind end event on collector", () => {
            const paginator = new Paginator(listener, {
                pages,
                nextPageFilter: () => true,
                previousPageFilter: () => true,
                endHandler: () => true,
            });
            expect(listener.on).toBeCalledWith("end", expect.any(Function));
        });
    });
    describe("Functional test", () => {
        test("Next Page", async () => {
            const paginator = new Paginator(listener, {
                pages,
                nextPageFilter: () => true,
                previousPageFilter: () => true,
            });
            expect(paginator.currentPage).toBe(0);
            await paginator.nextPage();
            expect(paginator.currentPage).toBe(1);
            await paginator.nextPage();
            expect(paginator.currentPage).toBe(0);
        });
        test("Previous Page", async () => {
            const paginator = new Paginator(listener, {
                pages,
                nextPageFilter: () => true,
                previousPageFilter: () => true,
            });
            expect(paginator.currentPage).toBe(0);
            await paginator.previousPage();
            expect(paginator.currentPage).toBe(1);
            await paginator.previousPage();
            expect(paginator.currentPage).toBe(0);
        });
        test("Next filter test", async () => {
            const paginator = new Paginator(
                {
                    ...listener,
                    on: jest
                        .fn()
                        .mockImplementation(
                            (
                                event: string,
                                cb: (arg: Interaction) => Promise<void>
                            ) => {
                                cb({ id: "next" } as Interaction);
                            }
                        ),
                } as unknown as BaseMessageListener,
                {
                    pages,
                    nextPageFilter: (arg) => arg.id === "next",
                    previousPageFilter: (arg) => arg.id === "prev",
                }
            );
            expect(paginator.currentPage).toBe(1);
        });
        test("Prev filter test", async () => {
            const paginator = new Paginator(
                {
                    ...listener,
                    on: jest
                        .fn()
                        .mockImplementation(
                            (
                                event: string,
                                cb: (arg: Interaction) => Promise<void>
                            ) => {
                                cb({ id: "prev" } as Interaction);
                            }
                        ),
                } as unknown as BaseMessageListener,
                {
                    pages,
                    nextPageFilter: (arg) => arg.id === "next",
                    previousPageFilter: (arg) => arg.id === "prev",
                }
            );
            expect(paginator.currentPage).toBe(1);
        });
    });
});
