const containerId = 'pluginStats';

const $c = (_) => document.createElement(_);

var options = [];

const render = (data, proposalData) => {
  cleanup();

  const choices = parseProposal(proposalData);
  const voteIds = Object.keys(data);

  // find the number of poll options
  const optionCount = voteIds.reduce((prev, curr) => {
    const choice = data[curr].choice;
    if (choice == prev || choice < prev) {
      return prev;
    } else if (choice > prev) {
      return choice;
    }
  }, 0);

  // build array of options
  for (let i = 1; i <= optionCount; i++) {
    options.push({
      number: i,
      title: choices[i-1],
    });
  }

  // find total vp cast
  const totalVp = voteIds.reduce((prev, curr) => {
    return prev + data[curr].vp;
  }, 0);


  // count up total vp cast for each option

  options.forEach((option) => {
    const optionVoteIds = voteIds.filter((voteId) => {
      return data[voteId].choice == option.number;
    });
    const optionVp = optionVoteIds.reduce((prev, voteId) => {
      return prev + data[voteId].vp;
    }, 0);
    option.vp = optionVp;
  });

  // set each option's approximate percent-of-total
  options.forEach((option) => {
    option.percent = Math.trunc(option.vp/totalVp * 100);
  });

  const stats = $c('div');
  const title = $c('div');
  stats.classList.add(containerId);

  title.textContent = 'CURRENT RESULTS';
  stats.append(title);

  // assign colors
  options.forEach((option) => {
    let colors;
    if (options.length > 2) {
      colors = [
        'FF851B',
        'FFDC00',
        'B10DC9',
        '85144b',
        '0074D9',
        '3D9970',
      ];
    } else {
      colors = [
        '2ECC40',
        'FF4136',
      ];
    }
    options.forEach((option)=>{
      option.color = colors[option.number - 1];
    });
  });

  // build progress bars
  options.forEach((option) => {
    const progress = $c('div');
    progress.classList.add('progressBarColor');
    progress.style.width = `${option.percent}%`;
    progress.style.backgroundColor = `#${option.color}`;

    const progressGrey = $c('div');
    progressGrey.classList.add('progressBarGrey');

    const progressBatch = $c('div');
    progressBatch.classList.add('progressBarGroup');
    progressBatch.append(progress);
    progressBatch.append(progressGrey);

    const title = $c('li');
    title.textContent = `${option.title}: ${option.percent}%`;

    title.append(progressBatch);
    stats.append(title);
  });

  // add to document body
  document.querySelector('body').append(stats);
};

function setup() {
  const link = Array.from(document.querySelectorAll('a')).find((e) => e.innerText.includes('Vote on this proposal on the Decentraland DAO'));
  if (link) {
    const href = link.href;
    const regex = /(?<=\?id=).*/g;
    const id = href.match(regex);
    try {
      Promise.all([
        fetch(`https://governance.decentraland.org/api/proposals/${id}/votes`)
            .then((response) => response.json()),
        fetch(`https://governance.decentraland.org/api/proposals/${id}`).then((response) => response.json()),
      ])
          .then(([votes, proposal]) => {
            render(votes.data, proposal.data);
          });
    } catch (e) {
      console.error(e);
    }
  } else {
    cleanup();
  }
}

function cleanup() {
  try {
    Array.from(document.getElementsByClassName(containerId)).map((e) => {
      e.remove();
    });
    options = [];
  } catch (e) {}
}


function parseProposal(proposalData) {
  return choices = proposalData.configuration.choices;
}

window.onload = setup;

chrome.runtime.onMessage.addListener(() => {
  cleanup();
  setup();
});
