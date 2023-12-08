<script lang="ts">
  import { onMount } from "svelte";
  import OnlineOcrPlugin from "..";
  import { Job } from "@/types/job";
  import { Menu, showMessage } from "siyuan";

  let svg: SVGElement;

  let menuOpen = false;
  let menu;

  onMount(() => {
    const rect = svg.getBoundingClientRect();
    console.log(rect);
    const result = job.jobResult.raw;
    result.analyzeResult.readResults.forEach((res) => {
      svg.setAttribute("viewBox", `0 0 ${res.width} ${res.height}`);
      res.lines.forEach((line) => {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        const box = line.boundingBox;
        const x = box[0];
        const y = box[1];
        const width = (box[2] - box[0]);
        const height = (box[5] - box[1]);
        rect.setAttribute("x", String(x));
        rect.setAttribute("y", String(y));
        rect.setAttribute("width", String(width));
        rect.setAttribute("height", String(height));
        rect.setAttribute("fill", `#ffff0073`);
        rect.setAttribute("stroke-width", `1`);
        rect.setAttribute("stroke", `#ffff00`);
        rect.setAttribute("title", line.text);
        rect.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          svg.querySelectorAll('rect').forEach((e) => e.classList.remove('selected'));
          if (menuOpen) {
            menuOpen = false;
            menu.close();
            return;
          }
          (e.target as SVGRectElement).classList.add('selected');
          menuOpen = true;
          const m = new Menu('onlineOcrDetailClick', () => {
            (e.target as SVGRectElement).classList.remove('selected');
          });
          m.addItem({
            label: (e.target as SVGRectElement).getAttribute('title'),
            icon: 'iconCopy',
            click: () => {
              const title = (e.target as SVGRectElement).getAttribute('title');
              navigator.clipboard.writeText(title);
              showMessage('Copied: ' + title);
            },
          });
          m.open({
            x: e.clientX,
            y: e.clientY,
          });
          menu = m;
        });
        svg.appendChild(rect);
      });

      
    });
  });

  export let plugin: OnlineOcrPlugin;
  export let job: Job;
</script>

<div class="job-detail">
  <div class="job-image">
    <img src={job.jobImage} alt={job.jobImage} />
    <svg bind:this={svg} class="job-image-svg" xmlns="http://www.w3.org/2000/svg"></svg>
  </div>
</div>
