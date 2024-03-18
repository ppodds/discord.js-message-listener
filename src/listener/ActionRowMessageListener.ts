import {
    ButtonInteraction,
    CacheType,
    Message,
    ActionRowBuilder,
    MessageComponentInteraction,
    SelectMenuInteraction,
    Snowflake,
    ButtonStyle,
    ComponentType,
    Collector,
    ButtonBuilder,
    SelectMenuBuilder,
} from "discord.js";
import {
    BaseMessageListener,
    BaseMessageListenerOptions,
} from "./BaseMessageListener";

export interface ActionRowMessageListenerOptions
    extends BaseMessageListenerOptions<
        [ButtonInteraction<CacheType> | SelectMenuInteraction<CacheType>]
    > {
    messageActionRows: ActionRowBuilder[];
}

export class ActionRowMessageListener extends BaseMessageListener<
    Snowflake,
    ButtonInteraction<CacheType> | SelectMenuInteraction<CacheType>
> {
    constructor(message: Message, options: ActionRowMessageListenerOptions) {
        super(message, options);
        options.messageActionRows.forEach((messageActionRow) => {
            messageActionRow.components.forEach((component, index) => {
                if (
                    component.data.type !== ComponentType.Button &&
                    component.data.type !== ComponentType.StringSelect
                )
                    return;
                // TODO: fix type
                if (component.data.type === ComponentType.Button) {
                    const button = component as ButtonBuilder;
                    // A custom id and url cannot both be specified
                    if (!(button.data as unknown as { url?: string }).url)
                        button.setCustomId(
                            (button.data as unknown as { custom_id?: string })
                                .custom_id
                                ? (
                                      button.data as unknown as {
                                          custom_id: string;
                                      }
                                  ).custom_id
                                : `button-${index}`,
                        );

                    // Set style to default if not specified
                    if (!button.data.style)
                        button.setStyle(
                            (button.data as unknown as { url?: string }).url
                                ? ButtonStyle.Link
                                : ButtonStyle.Primary,
                        );
                } else {
                    const selectMenu = component as SelectMenuBuilder;
                    if ((selectMenu.data as { custom_id?: string }).custom_id)
                        return;
                    selectMenu.setCustomId(
                        (
                            selectMenu.data as unknown as {
                                custom_id?: string;
                            }
                        ).custom_id
                            ? (
                                  selectMenu.data as unknown as {
                                      custom_id: string;
                                  }
                              ).custom_id
                            : `select-menu-${index}`,
                    );
                }
            });
        });
    }

    protected override createCollector() {
        // TODO: fix type
        return this.message.createMessageComponentCollector<
            ComponentType.Button | ComponentType.StringSelect
        >(this.options.collectorOptions) as unknown as Collector<
            string,
            ButtonInteraction<CacheType> | SelectMenuInteraction<CacheType>,
            []
        >;
    }

    protected override async collect(
        arg: ButtonInteraction<CacheType> | SelectMenuInteraction<CacheType>,
    ): Promise<void> {
        super.collect(arg);
        await (arg as MessageComponentInteraction).deferUpdate();
    }

    protected override async prestart(): Promise<void> {
        if (!this.message.editable) throw new Error("Message must be editable");
        await this.message.edit({
            // TODO: fix type
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            components: (this.options as ActionRowMessageListenerOptions)
                .messageActionRows,
        });
    }
}
