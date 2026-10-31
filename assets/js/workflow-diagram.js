(() => {
  document.querySelectorAll('.workflow-layout').forEach(layout => {
    const phases = layout.querySelectorAll('.workflow-phase');
    const svg = layout.querySelector('.workflow-loop svg');
    const path = svg?.querySelector('.workflow-loop-path');
    const label = layout.querySelector('.workflow-loop span');
    if (!path || !label || phases.length < 4) return;

    function drawLoop() {
      const bounds = layout.getBoundingClientRect();
      const prototype = phases[2].getBoundingClientRect();
      const review = phases[3].getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
      const horizontal = review.left >= prototype.right;
      let startX, startY, endX, endY, curveX, curveY;
      if (horizontal) {
        startX = review.left + review.width / 2 - bounds.left;
        endX = prototype.left + prototype.width / 2 - bounds.left;
        startY = review.bottom - bounds.top + 2;
        endY = prototype.bottom - bounds.top + 5;
        curveY = Math.max(startY, endY) + 42;
        path.setAttribute('d', `M${startX} ${startY} C${startX} ${curveY} ${endX} ${curveY} ${endX} ${endY}`);
        label.style.left = `${(startX + endX) / 2}px`;
        label.style.top = `${curveY + 2}px`;
        label.style.transform = 'translateX(-50%)';
      } else {
        startX = review.left - bounds.left - 2;
        endX = prototype.left - bounds.left - 5;
        startY = review.top + review.height / 2 - bounds.top;
        endY = prototype.top + prototype.height / 2 - bounds.top;
        curveX = Math.min(startX, endX) - 36;
        path.setAttribute('d', `M${startX} ${startY} C${curveX} ${startY} ${curveX} ${endY} ${endX} ${endY}`);
        label.style.left = `${curveX - 13}px`;
        label.style.top = `${(startY + endY) / 2}px`;
        label.style.transform = 'translate(-50%, -50%) rotate(-90deg)';
      }
    }

    const observer = new ResizeObserver(drawLoop);
    [layout, phases[2], phases[3]].forEach(element => observer.observe(element));
    document.fonts.ready.then(drawLoop);
    drawLoop();
  });
})();
