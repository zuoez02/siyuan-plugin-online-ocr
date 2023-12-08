<script lang="ts">
  import { Job, JobStatus, JobType } from "@/types/job";

  const getLink = (job: Job) => {
    switch (job.jobStatus) {
      case JobStatus.FAILED:
        return "#iconClose";
      case JobStatus.PENDING:
        return "#iconClock";
      case JobStatus.RUNNING:
        return "#iconClock";
      case JobStatus.SUCCESS:
        return "#iconSelect";
    }
  };

  export let job: Job;
</script>

<div class="job">
  <div class="job-name">
    <span>{job.jobName}</span>
    <span><svg><use xlink:href={getLink(job)}></use></svg></span>
  </div>
  {#if job.jobType === JobType.IMAGE_BASE64 || job.jobType === JobType.IMAGE_URL}
    <div class="job-image">
      <img src={job.jobImage} alt={job.jobImage} />
    </div>
  {/if}
  {#if job.jobResult}
    <div>{typeof job.jobResult} {job.jobResult}</div>
    <div><pre>{job.jobResult?.text}</pre></div>
  {/if}
</div>
