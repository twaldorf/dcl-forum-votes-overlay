const render = (data) => {
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
    console.log(totalVp, total1, total2, percentOfTotal1, percentOfTotal2)

    const stats = document.createElement('div')
    stats.id = 'pluginStats'
    const vpPercent1 = document.createElement('li').textContent = `Yes: ${percentOfTotal1}%`
    const vpPercent2 = document.createElement('li').textContent = `No: ${percentOfTotal2}%`
    stats.style.position = 'fixed'
    stats.style.right = '1rem'
    stats.style.bottom = '1rem'
    stats.style.backgroundColor = '#ffffff'
    stats.style.display = 'flex'
    document.querySelector('body').append(stats)
    document.getElementById('pluginStats').append(vpPercent1)
    document.getElementById('pluginStats').append(vpPercent2)
}

const setup = () => {
    const link = Array.from(document.querySelectorAll('a')).find(e => e.innerText == "Vote on this proposal on the Decentraland DAO")
    if (link) {
        const href = link.href
        const regex = /(?<=\?id=).*/g
        const id = href.match(regex)
        try {
            const votes = fetch(`https://governance.decentraland.org/api/proposals/${id}/votes`)
                .then(response => response.json()).then(data => {render(data.data)})
        } catch (e) {
            console.error(e)
        }
    }
}

setup()

window.addEventListener('onhashchange', () => {
    setup()
})
