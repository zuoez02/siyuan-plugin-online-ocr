<script lang="ts">
  import { Job, JobStatus, JobType } from "@/types/job";
  import { Dialog, Plugin, openTab, showMessage } from "siyuan";
  import OnlineOcrPlugin from "..";
  import JobDetail from "./job-detail.svelte";

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

  const jumpTo = (id: string) => {
    openTab({
      app: plugin.app,
      doc: {
        id,
      },
    });
  };

  const copyContent = () => {
    const text = job.jobResult.text;
    navigator.clipboard.writeText(text);
    showMessage("内容已复制");
  };

  const showDetail = () => {
    const dialog = new Dialog({
      title: "job-detail",
    //   width: "700px",
      content: '<div id="job-detail-container"></div>',
      disableAnimation: true,
    });

    new JobDetail({
      target: dialog.element.querySelector('#job-detail-container'),
      props: {
        plugin,
        job,
      },
    });
  };

  const remove = () => plugin.removeJob(job);
  export let plugin: OnlineOcrPlugin;
  export let job: Job;
</script>

<div class="job">
  <div class="job-name">
    <a on:click={() => jumpTo(job.jobName)}>{job.jobName}</a>
    <span><svg><use xlink:href={getLink(job)}></use></svg></span>
  </div>
  {#if job.jobType === JobType.IMAGE_BASE64 || job.jobType === JobType.IMAGE_URL}
    <div class="job-image">
      <img src={job.jobImage} alt={job.jobImage} />
    </div>
  {/if}
  {#if job.jobResult}
    <div class="job-result">
      <span class="job-result-button">
        <svg on:click={showDetail}><use xlink:href="#iconZoomIn"></use></svg>
        <svg on:click={copyContent}><use xlink:href="#iconCopy"></use></svg>
        <svg on:click={remove}><use xlink:href="#iconTrashcan"></use></svg>
      </span>
    </div>
  {/if}
</div>
