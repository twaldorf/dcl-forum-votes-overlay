const containerId = 'pluginStats'

const $c = (_) => document.createElement(_)

const render = (data) => {
    cleanup()

    //find the number of poll options
    const optionCount = Object.keys(data).reduce((prev,curr) => {
        let choice = data[curr].choice
        if (choice == prev || choice < prev) { return prev} else if (choice > prev) {return choice}
    }, 0)

    //build array of options
    var options = []
    for (let i = 0; i <= optionCount; i++) {
        options.push({
            number: i, 
            title: `Choice ${i}`,
        })
    }

    // find total vp cast
    const totalVp = Object.keys(data).reduce((prev, curr) => {
        return prev + data[curr].vp
    },0)

    //count up total vp cast for each option
    options.reduce((prev,curr,index) => {
        options[index].vp = Object.keys(data).filter((voteId) => {
            return data[voteId].choice == index
        }).reduce((p,c) => {
            return p + c.vp
        }, 0)
    })

    //find each option's percent-of-total
    options.forEach(option => {
        option.percent = Math.trunc(option.vp/totalVp * 100)
    })

    const stats = $c('div')
    const title = $c('div')
    stats.classList.add(containerId)
    
    title.textContent = 'CURRENT RESULTS'
    stats.append(title)

    // assign colors
    options.forEach(option => {
        if (options.length > 2) {
            option.color = `${option.number * 10}${option.number * 20}${option.number * 20}`
        }
    })

    // build progress bars
    options.forEach(option => {
        const progress = $c('div')
        progress.classList.add('progressBarColor')
        progress.style.width = `${option.percent}%`
        progress.style.backgroundColor = `#${option.color}`

        const progressGrey = $c('div')
        progressGrey.classList.add('progressBarGrey')

        const progressBatch = $c('div')
        progressBatch.classList.add('progressBarGroup')
        progressBatch.append(progress)
        progressBatch.append(progressGrey)

        const title = $c('li')
        title.textContent = `${option.title}: ${option.percent}%`

        title.append(progressBatch)
        stats.append(title)
    })

    //add to document body
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
    cleanup()
    setup()
});
