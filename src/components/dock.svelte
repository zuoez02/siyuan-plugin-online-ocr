<script lang="ts">
  import { adaptHotkey } from "siyuan";
  import { Job } from "@/types/job";
  import OnlineOcrPlugin from "..";
  import { ExtendedArray } from "@/utils";
  import { onMount } from "svelte";
  import JobComponent from './job.svelte';

  let _jobs = [];

  onMount(() => {
    _jobs = [...jobs].reverse();

    jobs.on("update", () => {
      _jobs = [...jobs].reverse();
    });
    jobs.on("check", () => {
      _jobs = [...jobs].reverse();
    });
  });

  export let plugin: OnlineOcrPlugin;
  export let jobs: ExtendedArray<Job>;
</script>

<div class="fn__flex-1 fn__flex-column plugin-online-ocr-dock">
  <div class="block__icons">
    <div class="block__logo">
      <svg class="block__logoicon"><use xlink:href="#iconOnlineOcr"></use></svg>
      {plugin.i18n.title}
    </div>
    <span class="fn__flex-1 fn__space"></span>
    <span
      data-type="min"
      class="block__icon b3-tooltips b3-tooltips__sw"
      aria-label="{plugin.i18n.min} {adaptHotkey('⌘W')}"
      ><svg><use xlink:href="#iconMin"></use></svg></span
    >
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <span
      on:click={() => plugin.openSetting()}
      id="setting"
      data-type="setting"
      class="block__icon b3-tooltips b3-tooltips__sw"
      aria-label="{plugin.i18n.setting}"
      ><svg><use xlink:href="#iconSettings"></use></svg></span
    >
  </div>
  <div class="fn__flex-1">
    {#if _jobs.length > 0}
    {#each _jobs as job}
      <JobComponent bind:job={job} bind:plugin></JobComponent>
    {/each}
    {:else}
      <div class="empty">{plugin.i18n.startUse}</div>
    {/if}
  </div>
</div>
