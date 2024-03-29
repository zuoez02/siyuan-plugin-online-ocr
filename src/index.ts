import { Plugin } from 'siyuan';
import { Job, JobProvider, JobStatus, JobType } from './types/job';
import { PluginConfig } from './types/setting';
import { SettingUtils } from "./libs/setting-utils";
import { JobScheduler } from './engine/job-scheduler';
import Dock from './components/dock.svelte';
import { ExtendedArray } from './utils';
import "./index.scss";

export default class OnlineOcrPlugin extends Plugin {
    private settingUtils: SettingUtils;
    private jobScheduler: JobScheduler;

    config: PluginConfig = {
        ocrProvider: JobProvider.AZURE,
        azureEndpoint: '',
        azureServiceKey: '',
        maxJobsConcurrence: 5,
        maxJobsHistory: 20,
        autoAddAfterImage: false,
        baiduApiKey: '',
        baiduSecretKey: '',
        baiduHighAccurate: false,
    };

    jobs: ExtendedArray<Job> = new ExtendedArray();

    onload() {
        this.settingUtils = new SettingUtils(this, 'config', (data) => {
            Object.assign(this.config, data);
            this.saveStorage();
            this.jobScheduler.reloadConfig(data);
        });
        this.settingUtils.addItem({
            key: "ocrProvider",
            value: JobProvider.AZURE,
            type: "select",
            title: this.i18n.ocrProvider,
            description: this.i18n.ocrProviderDesc,
            options: {
                [JobProvider.AZURE]: 'Azure',
                [JobProvider.BAIDU]: 'Baidu',
            }
        });
        this.settingUtils.addItem({
            key: "azureEndpoint",
            value: "",
            type: "textinput",
            title: this.i18n.azureEndpoint,
            description: this.i18n.azureEndpointDesc,
        });
        this.settingUtils.addItem({
            key: "azureServiceKey",
            value: "",
            type: "textinput",
            title: this.i18n.azureServiceKey,
            description: this.i18n.azureServiceKeyDesc,
        });
        this.settingUtils.addItem({
            key: "maxJobsConcurrence",
            value: 50,
            type: "slider",
            title: this.i18n.maxJobsConcurrence,
            description: this.i18n.maxJobsConcurrenceDesc,
            slider: {
                min: 1,
                max: 5,
                step: 1,
            }
        });
        this.settingUtils.addItem({
            key: "maxJobsHistory",
            value: 50,
            type: "slider",
            title: this.i18n.maxJobsHistory,
            description: this.i18n.maxJobsHistoryDesc,
            slider: {
                min: 1,
                max: 50,
                step: 1,
            }
        });
        this.settingUtils.addItem({
            key: "autoAddAfterImage",
            value: false,
            type: "checkbox",
            title: this.i18n.autoAddAfterImage,
            description: this.i18n.autoAddAfterImageDesc,
        });
        this.settingUtils.addItem({
            key: "baiduApiKey",
            value: '',
            type: "textinput",
            title: this.i18n.baiduApiKey,
            description: this.i18n.baiduApiKeyDesc,
        });
        this.settingUtils.addItem({
            key: "baiduSecretKey",
            value: '',
            type: "textinput",
            title: this.i18n.baiduSecretKey,
            description: this.i18n.baiduSecretKeyDesc,
        });
        this.settingUtils.addItem({
            key: "baiduHighAccurate",
            value: false,
            type: "checkbox",
            title: this.i18n.baiduHighAccurate,
            description: this.i18n.baiduHighAccurateDesc,
        });

        this.eventBus.on('open-menu-image', (e) => {
            const detail = e.detail;
            const menu = detail.menu;
            menu.addItem({
                label: this.i18n.menuOnlineOcr,
                icon: 'iconOnlineOcr',
                click: () => {
                    const src = e.detail.element.querySelector('img')?.getAttribute('src');
                    if (src.startsWith('data')) {
                        this.createJob(src, JobType.IMAGE_BASE64, detail.protyle.block.id);
                    } else {
                        this.createJob(src, JobType.IMAGE_URL, detail.protyle.block.id);
                    }
                }
            })
        });

        this.jobs.on('check', () => {
            this.saveStorage();
        })
    }

    async onLayoutReady() {
        this.addOcrDock();
        await this.loadStorage();
        this.addIcons(`<symbol id="iconOnlineOcr" viewBox="0 0 1024 1024" ><path d="M1022.54 731.84v182.08c0 60.23-49.01 109.25-109.25 109.25H694.81c-20.14 0-36.42-16.28-36.42-36.42s16.28-36.42 36.42-36.42H913.3c20.1 0 36.42-16.31 36.42-36.41V731.84c0-20.14 16.27-36.42 36.42-36.42 20.13 0 36.4 16.28 36.4 36.42zM294.07 950.33H111.99c-20.06 0-36.41-16.31-36.41-36.41V731.84c0-20.14-16.31-36.42-36.42-36.42-20.1 0-36.41 16.28-36.41 36.42v182.08c0 60.23 49.01 109.25 109.24 109.25h182.08c20.1 0 36.42-16.28 36.42-36.42s-16.32-36.42-36.42-36.42zM38.16 328.1c20.1 0 36.42-16.31 36.42-36.41V109.61c0-20.07 16.35-36.42 36.41-36.42h182.08c20.1 0 36.42-16.31 36.42-36.41 0-20.1-16.31-36.42-36.42-36.42H110.99C50.76 0.36 1.75 49.38 1.75 109.61v182.08c0 20.1 16.31 36.41 36.41 36.41zM914.3 0.36H695.81c-20.14 0-36.42 16.31-36.42 36.42 0 20.1 16.28 36.41 36.42 36.41H914.3c20.1 0 36.42 16.35 36.42 36.42v182.08c0 20.1 16.27 36.41 36.42 36.41 20.14 0 36.41-16.31 36.41-36.41V109.61C1023.54 49.38 974.53 0.36 914.3 0.36zM383.4 509.78c0 97.6-55.2 156-136.4 156s-136.4-58.4-136.4-156 55.2-152.8 136.4-152.8 136.4 55.6 136.4 152.8z m-72.8 0c0-57.6-24.4-91.6-63.6-91.6s-63.2 34-63.2 91.6c0 58 24 94.4 63.2 94.4s63.6-36.4 63.6-94.4z m246.8 94.4c-42 0-69.2-34.4-69.2-93.6 0-58 31.6-92.4 70-92.4 21.2 0 36.8 9.6 51.6 23.2l37.6-45.6c-20.4-20.8-51.6-38.8-90.4-38.8-75.6 0-142 56.8-142 156 0 100.8 64 152.8 139.6 152.8 38.8 0 72-14.8 97.2-44l-37.6-44.8c-14 15.2-33.2 27.2-56.8 27.2z m302.4-62l66.4 118h-80l-54.8-104.8H757v104.8h-71.6v-297.6h109.2c63.6 0 116.4 21.6 116.4 93.6 0 43.6-20.4 71.6-51.2 86z m-18.8-86c0-28-18-37.2-52-37.2h-32v80h32c34 0 52-14.8 52-42.8z" p-id="1526"></path></symbol>`)
        this.jobScheduler = new JobScheduler(this.jobs, this.config, this);
        this.jobScheduler.start();
    }

    addOcrDock() {
        this.addDock({
            config: {
                position: 'RightTop',
                size: {
                    width: 200,
                    height: 200,
                },
                icon: 'iconOnlineOcr',
                title: this.i18n.title,
            },
            type: 'onlineOcrJobs',
            data: {
                jobs: this.jobs,
                plugin: this,
            },
            init() {
                new Dock({
                    target: this.element,
                    props: {
                        plugin: this.data.plugin,
                        jobs: this.data.jobs,
                    }
                })
            }
        })
    }

    showSetting() {
        this.setting.open('OnlineOcr');
    }

    async loadStorage() {
        await this.settingUtils.load();
        const conf = this.settingUtils.dump();
        const jobs = await this.loadData('jobs.json');
        Object.assign(this.config, conf);
        this.jobs.push(...(jobs || []));
        this.jobs.dispatch('update');
    }

    saveStorage() {
        this.saveData('jobs.json', this.jobs);
        this.saveData('config.json', this.config);
    }

    createJob(image: string, type: JobType, name: string) {
        const job: Job = {
            jobName: name,
            jobDate: new Date().getTime(),
            jobProvier: this.config.ocrProvider,
            jobImage: image,
            jobType: type,
            jobStatus: JobStatus.PENDING,
            jobResult: null,
        }
        this.jobs.push(job);
        this.jobs.dispatch('update');
    }

    removeJob(job: Job) {
        const i = this.jobs.findIndex((i) => i.jobDate === job.jobDate);
        console.log(job, i);
        if (i >= 0) {
            this.jobs.splice(i, 1);
            this.jobs.dispatch('check');
        }
    }
}