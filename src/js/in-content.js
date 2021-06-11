const containerId = 'pluginStats'

const $c = (_) => document.createElement(_)

const render = (data) => {
    cleanup()
    const totalVp = Object.keys(data).reduce((prev, curr) => {
        return prev + data[curr].vp
    },0)
    let total1 = 0
    let total2 = 0
    Object.keys(data).map((key) => {
        if (data[key].choice == 1){
            total1 += data[key].vp
        }
        if (data[key].choice == 2){
            total2 += data[key].vp
        }
    })
    const percentOfTotal1 = Math.trunc(total1/totalVp * 100)
    const percentOfTotal2 = Math.trunc(total2/totalVp * 100)

    const stats = $c('div')
    const title = $c('div')
    stats.classList.add(containerId)
    
    title.textContent = 'CURRENT RESULTS'

    // build progress bars
    const progress1 = $c('div')
    progress1.classList.add('progress-bar-color')
    progress1.style.width = `${percentOfTotal1}%`
    const progress2 = $c('div')
    progress2.classList.add('progress-bar-color')
    progress2.style.width = `${percentOfTotal2}%`
    const progress1grey = $c('div')
    progress1grey.classList.add('progress-bar-grey')
    const progress2grey = $c('div')
    progress2grey.classList.add('progress-bar-grey')

    const progressBatch1 = $c('div')
    progressBatch1.classList.add('progressBarGroup')
    progressBatch1.append(progress1)
    progressBatch1.append(progress1grey)

    const progressBatch2 = $c('div')
    progressBatch2.classList.add('progressBarGroup')
    progressBatch2.append(progress2)
    progressBatch2.append(progress2grey)

    //build percents
    const vpPercent1 = $c('li')
    vpPercent1.textContent = `Yes: ${percentOfTotal1}%`
    const vpPercent2 = $c('li')
    vpPercent2.textContent = `No: ${percentOfTotal2}%`

    //assemble final panel
    vpPercent1.append(progressBatch1)
    vpPercent2.append(progressBatch2)
    stats.append(title)
    stats.append(vpPercent1)
    stats.append(vpPercent2)

    document.querySelector('body').append(stats)
}

function setup () {
    const link = Array.from(document.querySelectorAll('a')).find(e => e.innerText.includes("Vote on this proposal on the Decentraland DAO"))
    if (link) {
        const href = link.href
        const regex = /(?<=\?id=).*/g
        const id = href.match(regex)
        try {
            const votes = fetch(`https://governance.decentraland.org/api/proposals/${id}/votes`)
                .then(response => response.json()).then(data => {
                    render(data.data)
                })
        } catch (e) {
            console.error(e)
        }
    } else {
        cleanup()
    }
}

function cleanup () {
    try {
        Array.from(document.getElementsByClassName(containerId)).map(e => {e.remove()})
    } catch(e) {}
}

window.onload = setup

chrome.runtime.onMessage.addListener(() => {
    console.log('updated');
    cleanup()
    setup()
});
