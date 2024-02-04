import { Job, JobProvider, JobStatus, JobType } from "@/types/job";
import { Provider } from "./provider";
import { BaiduProviderSetting } from "@/types/baidu";
import OnlineOcrPlugin from "..";
import { DetailBox } from "@/types/detail";

export class BaiduProvider extends Provider {
    name = JobProvider.BAIDU;

    access_token = '';

    declare setting: BaiduProviderSetting;

    constructor(setting: BaiduProviderSetting, private plugin: OnlineOcrPlugin) {
        super();
        this.setting = setting;
    }

    async runJob(job: Job): Promise<void> {
        if (!this.setting?.baiduApiKey || !this.setting?.baiduSecretKey) {
            job.jobStatus = JobStatus.FAILED;
            job.jobResult = {
                text: this.plugin.i18n.baiduNotConfigured,
            };
            return;
        }
        if (!this.access_token) {
            await this.getAccessToken();
        }
        let image: string;
        if (job.jobType === JobType.IMAGE_BASE64) {
            image = job.jobImage;
        } else {
            image = await this.getBase64FromURL(job.jobImage);
        }


        try {
            const result = await this.requestImage(image, this.setting.baiduHighAccurate);
            if (result) {
                job.jobStatus = JobStatus.SUCCESS;
                const words = [];
                result.words_result.forEach(re => {
                    words.push(re.words);
                });
                job.jobResult = {
                    text: words.join('\n'),
                    raw: this.setting.baiduHighAccurate ? result : null,
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

    }

    async getAccessToken() {
        return fetch(`https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${this.setting.baiduApiKey}&client_secret=${this.setting.baiduSecretKey}`).then((res) => {
            return res.json();
        }).then((data) => {
            if (data.access_token) {
                this.access_token = data.access_token;
            } else {
                throw Error("BAIDU OCR: access_token not found");
            }
        })
    }

    async requestImage(image: string, baiduHighAccurate: boolean) {
        const api = baiduHighAccurate ? 'https://aip.baidubce.com/rest/2.0/ocr/v1/accurate' : 'https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic';
        return fetch(`${api}?access_token=${this.access_token}`, {
            method: 'POST',
            body: `image=${encodeURIComponent(image)}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then((res) => {
            return res.json();
        });
    }

    async getBase64FromURL(imageUrl: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            fetch(imageUrl, {
                method: 'GET',
            }).then((res) => res.blob()).then((blob) => {
                reader.readAsDataURL(blob);
                reader.onload = function (e) {
                    resolve(e.target.result as string);
                }
                reader.onabort = (e) => {
                    reject(e);
                };
            }).catch(reject);
        })
    }
}