import { JobProvider } from "./job";

export interface PluginConfig {
    ocrProvider: JobProvider;
    azureEndpoint: string;
    azureServiceKey: string;
    maxJobsConcurrence: number;
    maxJobsHistory: number;
    autoAddAfterImage: boolean;
}