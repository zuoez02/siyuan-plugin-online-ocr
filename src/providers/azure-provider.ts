import { Job, JobProvider, JobStatus, JobType } from "@/types/job";
import { Provider } from "./provider";
import { AzureProviderSetting } from "@/types/azure";
import { sleep } from "@/utils";
import OnlineOcrPlugin from "..";

export class AzureProvider extends Provider {
    name = JobProvider.AZURE;

    declare setting: AzureProviderSetting;

    constructor(setting: AzureProviderSetting, private plugin: OnlineOcrPlugin) {
        super();
        this.setting = setting;
    }

    async runJob(job: Job): Promise<void> {
        if (!this.setting?.azureEndpoint || !this.setting?.azureServiceKey) {
            job.jobStatus = JobStatus.FAILED;
            job.jobResult = {
                text: this.plugin.i18n.azureNotConfigured,
            };
            return;
        }
        if (job.jobType === JobType.IMAGE_URL) {
            try {
                const img =  await this.getImageFromUrl(job.jobImage);
                const resUrl = await this.requestImage(img);
                const result = await this.waitResponseUrl(resUrl);
                if (result) {
                    job.jobStatus = JobStatus.SUCCESS;
                    const words = [];
                    result.analyzeResult.readResults.forEach(re => {
                        re.lines.forEach((l)=> {
                            words.push(l.text);
                        });
                    });
                    job.jobResult = {
                        text: words.join('\n'),
                        raw: result,
                    }
                } else {
                    job.jobStatus = JobStatus.FAILED;
                    job.jobResult = {
                        text: this.plugin.i18n.unknownError,
                    };
                }
            } catch (e) {
                job.jobStatus = JobStatus.FAILED;
                job.jobResult = e;
            }
        } else {
            job.jobStatus = JobStatus.FAILED;
                    job.jobResult = {
                        text: this.plugin.i18n.unknownError,
                    };
            return;
        }
    }

    async waitResponseUrl(url: string) {
        while (true) {
            const res = await fetch(url, {
                headers: {
                    "Ocp-Apim-Subscription-Key": this.setting.azureServiceKey,
                },
                method: 'GET',
            }).then((res) => res.json());
            if (res.status === 'succeeded') {
                return res;
            }
            if (res.status === 'running') {
                await sleep(1000);
                continue;
            }
            return null;
        }
    }

    getImageFromBase64(image: string) {
        
        const rawString = atob(image);
        const byteArray = new Uint8Array(rawString.length);

        for (let i = 0; i < rawString.length; i++) {
            byteArray[i] = rawString.charCodeAt(i);
        }

        return byteArray;
    }

    getImageFromUrl(imageUrl: string) {
        return fetch(imageUrl, {
            method: 'GET',
        }).then((res) => res.blob())
    }

    requestImage(image: Blob) {
        return fetch(`${this.setting.azureEndpoint}/vision/v3.2/read/analyze`, {
            method: 'POST',
            headers: {
                "Ocp-Apim-Subscription-Key": this.setting.azureServiceKey,
            },
            body: image,
        }).then((res) => {
            return res.headers.get('Operation-Location');
        });
    }
}