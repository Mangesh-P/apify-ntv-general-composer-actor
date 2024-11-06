import { ISettings } from './interface.js';

export function overrideSettingsByActor(setting: Partial<ISettings>): Partial<ISettings> {
    switch (setting.actorID) {
        case 'nativo/apify-ntv-actor-simple-screenshot':
            setting.runInEachActor = setting.runInEachActor || 5;
            setting.parallelRunsCount = setting.parallelRunsCount || 10;
            break;
        default:
            setting.runInEachActor = 1;
            setting.parallelRunsCount = 10;
            break;
    }
    return setting;
}
