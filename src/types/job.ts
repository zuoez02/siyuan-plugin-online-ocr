export interface Job {
    jobName: string;
    jobDate: number;
    jobStatus: JobStatus;
    jobType: JobType,
    jobImage: string;
    jobResult: Result;
    jobProvier: JobProvider;
}

export interface Result {
    raw?: any;
    text: string;
}

export enum JobProvider {
    AZURE = 'azure',
    BAIDU = 'baidu',
}

export enum JobType {
    IMAGE_URL = 'IMAGE_URL',
    IMAGE_BASE64 = 'IMAGE_BASE64',
}

export enum JobStatus {
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
}