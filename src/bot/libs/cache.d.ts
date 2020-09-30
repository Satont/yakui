import { Event } from '@bot/entities/Event';
import { Greeting } from '@bot/entities/Greeting';
import { Overlay } from '@bot/entities/Overlay';
import { Keyword } from '@bot/entities/Keyword';
import { Command, System } from '@src/typings';
declare const _default: {
    parsers: Map<string, {
        system: System;
        fnc: any;
    }>;
    commands: Map<string, Command>;
    commandsAliases: Map<string, Command>;
    overlays: Map<string, Overlay>;
    events: Map<string, Event>;
    greetings: Map<string, Greeting>;
    keywords: Map<string, Keyword>;
    init(): Promise<void>;
    updateCommands(): void;
    updateParsers(): void;
    updateOverlays(): Promise<void>;
    updateEvents(): Promise<void>;
    updateGreetings(): Promise<void>;
    updateKeywords(): Promise<void>;
};
export default _default;
