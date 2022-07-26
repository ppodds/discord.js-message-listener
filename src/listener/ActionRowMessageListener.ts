import {
    ButtonInteraction,
    CacheType,
    InteractionCollector,
    Message,
    MessageActionRow,
    MessageComponentInteraction,
    SelectMenuInteraction,
    Snowflake,
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
    extends BaseMessageListenerOptions<
        [ButtonInteraction<CacheType> | SelectMenuInteraction<CacheType>]
    > {
    messageActionRows: MessageActionRow[];
}

export class ActionRowMessageListener extends BaseMessageListener<
    Snowflake,
    ButtonInteraction<CacheType> | SelectMenuInteraction<CacheType>
> {
    constructor(message: Message, options: ActionRowMessageListenerOptions) {
        super(message, options);
        options.messageActionRows.forEach((messageActionRow) =>
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
            })
        );
    }

    protected override createCollector(): InteractionCollector<
        ButtonInteraction<CacheType> | SelectMenuInteraction<CacheType>
    > {
        return this.message.createMessageComponentCollector<
            "BUTTON" | "SELECT_MENU"
        >(this.options.collectorOptions);
    }

    protected override async collect(
        arg: ButtonInteraction<CacheType> | SelectMenuInteraction<CacheType>
    ): Promise<void> {
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
