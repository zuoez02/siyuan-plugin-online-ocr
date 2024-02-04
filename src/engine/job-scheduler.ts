import { AzureProvider } from "@/providers/azure-provider";
import { BaiduProvider } from '@/providers/baidu-provider';
import { Provider } from "@/providers/provider";
import { Job, JobProvider, JobStatus } from "@/types/job";
import { PluginConfig } from "@/types/setting";
import { ExtendedArray, sleep } from "@/utils";
import OnlineOcrPlugin from "..";

export class JobScheduler {
    private loop = true;
    private scheduledJobs: ExtendedArray<Job> = new ExtendedArray<Job>();
    private runningJobs: ExtendedArray<Job> = new ExtendedArray<Job>();
    private interval = 500;
    private providers = new Map<JobProvider, Provider>();

    constructor(private jobs: ExtendedArray<Job>, private config: PluginConfig, private plugin: OnlineOcrPlugin) {
        console.log(JSON.stringify(config))
    }

    public checkScheduledJobs() {
        this.scheduledJobs = new ExtendedArray<Job>();
        for (const job of this.jobs) {
            if (job.jobStatus === JobStatus.PENDING || job.jobStatus === JobStatus.RUNNING) {
                job.jobStatus = JobStatus.PENDING;
                this.scheduledJobs.push(job);
            }
        }
    }

    public start() {
        this.checkScheduledJobs();
        this.jobs.on('update', () => {
            this.checkScheduledJobs();
        })
        this.schedule();
    }

    public async schedule() {
        if (!this.loop) {
            return;
        }
        for (let i = this.runningJobs.length - 1; i > -1; i--) {
            const job = this.runningJobs[i];
            if (!this.isScheduledJob(job)) {
                this.runningJobs.splice(i, 1);
            }
        };
        for (const job of this.scheduledJobs) {
            if (!this.isScheduledJob(job)) {
                continue;
            }
            if (this.runningJobs.length >= this.config.maxJobsConcurrence) {
                continue;
            }
            job.jobStatus = JobStatus.RUNNING;
            const provider = this.loadProvider(job.jobProvier);
            (async () => {
                this.jobs.dispatch('check');
                await provider.runJob(job);
                this.jobs.dispatch('check');
            })();
            this.runningJobs.push(job);
            this.jobs.dispatch('run');
        }
        await sleep(this.interval);
         this.schedule();
    }

    public isScheduledJob(job: Job) {
        return [JobStatus.PENDING].some((s) => s === job.jobStatus);
    }

    public loadProvider(p: JobProvider) {
        if (this.providers.has(p)) {
            return this.providers.get(p);
        }
        if (p === JobProvider.AZURE) {
            console.log(this.config);
            this.providers.set(p, new AzureProvider(this.config, this.plugin));
        } else if (p === JobProvider.BAIDU) {
            this.providers.set(p, new BaiduProvider(this.config, this.plugin));
        }
        return this.providers.get(p);
    }

    public reloadConfig(config: PluginConfig) {
        this.config = config;
        this.providers.clear();
    }
}