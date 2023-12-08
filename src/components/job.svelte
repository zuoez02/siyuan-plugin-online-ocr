<script lang="ts">
  import { Job, JobStatus, JobType } from "@/types/job";
  import { Dialog, openTab, showMessage } from "siyuan";
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

  const getLabel = (job: Job) => {
    switch (job.jobStatus) {
      case JobStatus.FAILED:
        return plugin.i18n.statusFailed;
      case JobStatus.PENDING:
        return plugin.i18n.statusPending;
      case JobStatus.RUNNING:
        return plugin.i18n.statusRunning;
      case JobStatus.SUCCESS:
        return plugin.i18n.statusSuccess;
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
    showMessage(plugin.i18n.contentCopied);
  };

  const showDetail = () => {
    const dialog = new Dialog({
      title: plugin.i18n.jobDetail,
      content: '<div id="job-detail-container"></div>',
      disableAnimation: true,
    });

    new JobDetail({
      target: dialog.element.querySelector("#job-detail-container"),
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
    <a style="cursor: pointer" on:click={() => jumpTo(job.jobName)}
      >{job.jobName}</a
    >
    <span class="b3-tooltips b3-tooltips__sw" aria-label={getLabel(job)}
      ><svg><use xlink:href={getLink(job)}></use></svg></span
    >
  </div>
  {#if job.jobType === JobType.IMAGE_BASE64 || job.jobType === JobType.IMAGE_URL}
    <div class="job-image">
      <img src={job.jobImage} alt={job.jobImage} />
    </div>
  {/if}
  {#if job.jobResult}
    <div class="job-result">
      <span class="job-result-buttons">
        <span
          class="b3-tooltips b3-tooltips__e job-result-button"
          aria-label={plugin.i18n.openDetail}
          on:click={showDetail}
        >
          <svg><use xlink:href="#iconZoomIn"></use></svg>
        </span>
        <span
          class="b3-tooltips b3-tooltips__e job-result-button"
          aria-label={plugin.i18n.copyContent}
          on:click={copyContent}
        >
          <svg><use xlink:href="#iconCopy"></use></svg>
        </span>
        <span
          class="b3-tooltips b3-tooltips__e job-result-button"
          aria-label={plugin.i18n.removeJob}
          on:click={remove}
        >
          <svg><use xlink:href="#iconTrashcan"></use></svg>
        </span>
      </span>
    </div>
  {/if}
</div>
