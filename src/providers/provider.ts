import { Job } from "@/types/job";

export abstract class Provider {
    name: string;
    setting: any;

    abstract runJob(job: Job): Promise<void>;
}