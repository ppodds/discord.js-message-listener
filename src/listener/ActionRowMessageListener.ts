import {
    CacheType,
    Interaction,
    InteractionCollector,
    Message,
    MessageActionRow,
    MessageComponentInteraction,
} from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import {
    BaseMessageListener,
    BaseMessageListenerOptions,
} from "./BaseMessageListener";

function formatComponentType(type: "BUTTON" | "SELECT_MENU"): string {
    switch (type) {
        case "BUTTON":
            return "button";
        case "SELECT_MENU":
            return "select-menu";
    }
}

export interface ActionRowMessageListenerOptions
    extends BaseMessageListenerOptions {
    messageActionRows: MessageActionRow[];
}

export class ActionRowMessageListener extends BaseMessageListener {
    constructor(message: Message, options: ActionRowMessageListenerOptions) {
        super(message, options);
        options.messageActionRows.forEach((messageActionRow) => {
            if (!messageActionRow.components) return;

            messageActionRow.components.forEach((component, index) => {
                const { type, customId } = component;
                // set default customId
                component.customId = customId
                    ? customId
                    : `${formatComponentType(type)}-${index}`;

                if (type === "BUTTON") {
                    // A custom id and url cannot both be specified
                    if (component.url) component.customId = null;
                    // Set style to default if not specified
                    if (!component.style) {
                        component.setStyle(
                            component.url
                                ? MessageButtonStyles.LINK
                                : MessageButtonStyles.PRIMARY
                        );
                    }
                }
            });
        });
    }

    protected override createCollector(): InteractionCollector<
        MessageComponentInteraction<CacheType>
    > {
        return this.message?.createMessageComponentCollector(
            (this.options as ActionRowMessageListenerOptions).collectorOptions
        );
    }

    protected override async collect(arg: Interaction): Promise<void> {
        super.collect(arg);
        await (arg as MessageComponentInteraction).deferUpdate();
    }

    protected override async prestart(): Promise<void> {
        if (!this.message.editable) throw new Error("Message must be editable");
        await this.message.edit({
            components: (this.options as ActionRowMessageListenerOptions)
                .messageActionRows,
        });
    }
}
