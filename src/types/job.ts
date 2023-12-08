export interface Job {
    jobName: string;
    jobDate: number;
    jobStatus: JobStatus;
    jobType: JobType,
    jobImage: string;
    jobResult: any;
    jobProvier: JobProvider;
}

export enum JobProvider {
    AZURE = 'azure',
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